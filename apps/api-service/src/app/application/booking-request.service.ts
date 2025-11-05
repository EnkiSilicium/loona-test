import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BookingRequestInit,
  BookingRequest,
} from 'apps/api-service/src/app/domain/booking-request.entity';
import { BookingRequestRepository } from 'apps/api-service/src/app/infra/persistence/repository/booking-request.repository';
import {
  BookingRequestCreatedEvent,
  EventNames,
  GetBookingRequestDto,
  GetBookingResponseDto,
  PostBookingResponseDto,
} from 'contracts';
import { randomUUID } from 'node:crypto';
import { enqueueOutbox, TypeOrmUoW } from 'persistence';
import { isoNow } from 'shared-kernel';

@Injectable()
export class BookingRequestService {
  constructor(
    private readonly uow: TypeOrmUoW,
    private readonly bookingRequestRepo: BookingRequestRepository,
  ) { }

  async create(init: BookingRequestInit): Promise<PostBookingResponseDto> {
    return this.uow.run({}, async () => {
      const entity = new BookingRequest(init);
      await this.bookingRequestRepo.save(entity);

      enqueueOutbox({
        eventId: randomUUID(),
        bookingRequestId: entity.bookingRequestId,
        restarauntId: entity.restarauntId,
        bookAt: entity.bookAt,
        amountOfGuests: entity.amountOfGuests,
        eventName: EventNames.BookingCreated,
        createdAt: isoNow(),
        schemaV: 1,
      } satisfies BookingRequestCreatedEvent);

      return { bookingRequestId: entity.bookingRequestId };
    });
  }

  async confirm(bookingRequestId: string): Promise<void> {
    await this.uow.run({}, async () => {
      const bookingRequest: BookingRequest | null =
        await this.bookingRequestRepo.findById(bookingRequestId);

      this.assertBookingRequestIsFound(bookingRequest);

      bookingRequest.confirm();

      await this.bookingRequestRepo.save(bookingRequest);
    });
  }

  async reject(bookingRequestId: string): Promise<void> {
    await this.uow.run({}, async () => {
      const bookingRequest: BookingRequest | null =
        await this.bookingRequestRepo.findById(bookingRequestId);
      if (!bookingRequest) {
        throw new NotFoundException();
      }

      bookingRequest.reject();

      await this.bookingRequestRepo.save(bookingRequest);
    });
  }

  async read(bookingRequestId: string): Promise<GetBookingResponseDto> {
    return await this.uow.run({}, async () => {
      const bookingRequest =
        await this.bookingRequestRepo.findById(bookingRequestId);

      this.assertBookingRequestIsFound(bookingRequest);

      return {
        amountOfGuests: bookingRequest.amountOfGuests,
        bookAt: bookingRequest.bookAt,
        bookingRequestId: bookingRequest.bookingRequestId,
        restarauntId: bookingRequest.restarauntId,
        status: bookingRequest.status,
      };


    })

  }

  private assertBookingRequestIsFound(
    bookingRequest: BookingRequest | null,
  ): asserts bookingRequest is BookingRequest {
    if (!bookingRequest) {
      throw new NotFoundException();
    }
  }
}
