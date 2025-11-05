import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRequest } from 'apps/api-service/src/app/domain/booking-request.entity';
import { requireTxManager } from 'persistence';
import { Repository } from 'typeorm';

@Injectable()
export class BookingRequestRepository {
  private repo(): Repository<BookingRequest> {
    return requireTxManager().getRepository(BookingRequest);
  }
  async save(entity: BookingRequest): Promise<BookingRequest> {
    return this.repo().save(entity);
  }

  async findById(bookingRequestId: string): Promise<BookingRequest | null> {
    return this.repo().findOne({ where: { bookingRequestId } });
  }

  async requireById(bookingRequestId: string): Promise<BookingRequest> {
    const e = await this.findById(bookingRequestId);
    if (!e) throw new NotFoundException({ message: 'BookingRequest not found', bookingRequestId });
    return e;
  }

  async listByRestaurant(restarauntId: string): Promise<BookingRequest[]> {
    return this.repo().find({
      where: { restarauntId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(bookingRequestId: string): Promise<void> {
    await this.repo().delete({ bookingRequestId });
  }
}
