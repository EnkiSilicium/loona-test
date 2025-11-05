import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Booking } from '../../../domain/booking-entity';
import { requireTxManager } from 'persistence'

@Injectable()
export class BookingRepository {
  private repo(): Repository<Booking> {
    return requireTxManager().getRepository(Booking);
  }


  /**
   * Save a Booking domain entity.
   * Enforces idempotency on bookingRequestId:
   *  - if an existing booking with same bookingRequestId & same composite PK exists -> returns it
   *  - if an existing booking with same bookingRequestId but different PK exists -> 409
   */
  async save(entity: Booking): Promise<Booking> {
    const existing = await this.findByBookingRequestId(entity.bookingRequestId);
    if (existing) {
      const sameComposite =
        existing.restarauntId === entity.restarauntId &&
        existing.tableNumber === entity.tableNumber &&
        existing.bookAt === entity.bookAt;

      if (!sameComposite) {
        throw new ConflictException({
          message: 'Booking already exists for this bookingRequestId',
          bookingRequestId: entity.bookingRequestId,
          existing: {
            restarauntId: existing.restarauntId,
            tableNumber: existing.tableNumber,
            bookAt: existing.bookAt,
          },
          attempted: {
            restarauntId: entity.restarauntId,
            tableNumber: entity.tableNumber,
            bookAt: entity.bookAt,
          },
        });
      }
      // idempotent save: return existing
      return existing;
    }

    return this.repo().save(entity);
  }

  async findByPk(restarauntId: string, tableNumber: number, bookAt: string): Promise<Booking | null> {
    return this.repo().findOne({ where: { restarauntId, tableNumber, bookAt } });
  }

  async requireByPk(restarauntId: string, tableNumber: number, bookAt: string): Promise<Booking> {
    const e = await this.findByPk(restarauntId, tableNumber, bookAt);
    if (!e) throw new NotFoundException({ message: 'Booking not found', restarauntId, tableNumber, bookAt });
    return e;
  }

  async findByBookingRequestId(bookingRequestId: string): Promise<Booking | null> {
    return this.repo().findOne({ where: { bookingRequestId } });
  }

  async listByRestaurantAndTime(restarauntId: string, bookAt: string): Promise<Booking[]> {
    return this.repo().find({ where: { restarauntId, bookAt }, order: { tableNumber: 'ASC' } });
  }

  async updateGuests(
    restarauntId: string, tableNumber: number, bookAt: string, amountOfGuests: number,
  ): Promise<Booking> {
    const e = await this.requireByPk(restarauntId, tableNumber, bookAt);
    e.amountOfGuests = amountOfGuests;
    return this.repo().save(e);
  }

  async delete(restarauntId: string, tableNumber: number, bookAt: string): Promise<void> {
    await this.repo().delete({ restarauntId, tableNumber, bookAt });
  }
}
