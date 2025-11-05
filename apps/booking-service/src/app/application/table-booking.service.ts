// src/app/booking/application/table-booking.service.ts
import { Injectable } from '@nestjs/common';
import { BookingInit, Booking } from 'apps/booking-service/src/app/domain/booking-entity';
import { BookingRepository } from 'apps/booking-service/src/app/infra/persistence/repository/booking-repository';
import { DiningTableRepository } from 'apps/booking-service/src/app/infra/persistence/repository/dining-table.repository';
import { BookingConfirmedEvent, BookingRejected, EventNames } from 'contracts';
import { randomUUID } from 'node:crypto';
import { enqueueOutbox, TypeOrmUoW } from 'persistence';
import { isoNow } from 'shared-kernel';


export type BookingRequestCreatedCommand = {
  bookingRequestId: string;
  restarauntId: string;
  bookAt: string;
  amountOfGuests: number;
};

@Injectable()
export class TableBookingService {
  constructor(
    private readonly uow: TypeOrmUoW,
    private readonly tableRepo: DiningTableRepository,
    private readonly bookingRepo: BookingRepository,
  ) { }

  async tryPlaceBookingFromRequest(cmd: BookingRequestCreatedCommand): Promise<void> {
    return this.uow.run({}, async () => {

      const existing = await this.bookingRepo.findByBookingRequestId(cmd.bookingRequestId);
      if (existing) {
        return
      }

      const free = await this.tableRepo.getFreeTableFor(
        cmd.restarauntId,
        cmd.amountOfGuests,
        cmd.bookAt,
      );
      if (!free) {
        enqueueOutbox(
          {
            eventId: randomUUID(),
            bookingRequestId: cmd.bookingRequestId,
            restarauntId: cmd.restarauntId,
            bookAt: cmd.bookAt,
            amountOfGuests: cmd.amountOfGuests,
            eventName: EventNames.BookingRejected,
            createdAt: isoNow(),
            schemaV: 1
          } satisfies BookingRejected,
        );

        return
      };


      const init: BookingInit = {
        restarauntId: cmd.restarauntId,
        tableNumber: free.tableNumber,
        bookAt: cmd.bookAt,
        amountOfGuests: cmd.amountOfGuests,
        bookingRequestId: cmd.bookingRequestId,
      };
      const entity = new Booking(init);

      await this.bookingRepo.save(entity);

      enqueueOutbox(
        {
          eventId: randomUUID(),
          bookingRequestId: cmd.bookingRequestId,
          restarauntId: cmd.restarauntId,
          bookAt: cmd.bookAt,
          amountOfGuests: cmd.amountOfGuests,
          eventName: EventNames.BookingConfirmed,
          createdAt: isoNow(),
          schemaV: 1
        } satisfies BookingConfirmedEvent,
      );


      return
    });
  }

}
