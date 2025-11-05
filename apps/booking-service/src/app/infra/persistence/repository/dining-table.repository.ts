import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { requireTxManager } from 'persistence'
import { Booking } from '../../../domain/booking-entity';
import { DiningTable } from '../../../domain/dining-table.entity';

@Injectable()
export class DiningTableRepository {
  private repo(): Repository<DiningTable> {
    return requireTxManager().getRepository(DiningTable);
  }


  async save(entity: DiningTable): Promise<DiningTable> {
    return this.repo().save(entity);
  }

  async insert(entity: DiningTable): Promise<void> {
    try {
      this.repo().insert(entity);
    } catch (error) {
      throw new ConflictException()
    }
  }



  async findById(restarauntId: string, tableNumber: number): Promise<DiningTable | null> {
    return this.repo().findOne({ where: { restarauntId, tableNumber } });
  }

  async requireById(restarauntId: string, tableNumber: number): Promise<DiningTable> {
    const e = await this.findById(restarauntId, tableNumber);
    if (!e) throw new NotFoundException({ message: 'Table not found', restarauntId, tableNumber });
    return e;
  }

  async listByRestaurant(restarauntId: string): Promise<DiningTable[]> {
    return this.repo().find({ where: { restarauntId }, order: { tableNumber: 'ASC' } });
  }

  async updateCapacity(restarauntId: string, tableNumber: number, capacity: number): Promise<DiningTable> {
    const e = await this.requireById(restarauntId, tableNumber);
    e.capacity = capacity;
    return this.repo().save(e);
  }

  async delete(restarauntId: string, tableNumber: number): Promise<void> {
    await this.repo().delete({ restarauntId, tableNumber });
  }

  // ---- Availability query ----
  /**
   * Least-capacity table in this restaurant with capacity >= required `capacity`
   * and NO booking at exact `bookAtIso` (ISO-8601, whole-hour), or null.
   */
  async getFreeTableFor(
    restarauntId: string,
    capacity: number,
    bookAtIso: string,
  ): Promise<DiningTable | null> {
    const qb = this.repo().createQueryBuilder('t')
      .leftJoin(
        Booking,
        'b',
        'b.restarauntId = t.restarauntId AND b.tableNumber = t.tableNumber AND b.bookAt = :bookAt',
        { bookAt: bookAtIso },
      )
      .where('t.restarauntId = :restarauntId', { restarauntId })
      .andWhere('t.capacity >= :capacity', { capacity })
      .andWhere('b.bookAt IS NULL')
      .orderBy('t.capacity', 'ASC')
      .addOrderBy('t.tableNumber', 'ASC')
      .limit(1);

    const found = await qb.getOne();
    return found ?? null;
  }
}
