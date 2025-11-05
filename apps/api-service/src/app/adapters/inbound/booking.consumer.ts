import {
    Controller,
    UseInterceptors,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BookingRequestService } from 'apps/api-service/src/app/application/booking-request.service';
import { KafkaTopics, EventNames } from 'contracts';
import type { BaseEvent } from 'contracts';
import { LoggingInterceptor } from 'observability';
import { assertIsBookingEvent, assertIsObject } from 'shared-kernel';

@Controller()
export class BookingConsumer {
    constructor(private readonly bookingRequestService: BookingRequestService) { }

    @UseInterceptors(LoggingInterceptor)
    @EventPattern(KafkaTopics.Booking)
    async onOrderTransitions(@Payload() payload: BaseEvent<string>) {
        await this.route({ ...payload });
    }

    // If event is invalid, it's detected at the application/domain layer.

    private async route(event: BaseEvent<string>): Promise<void> {
        assertIsObject(event);
        assertIsBookingEvent(event)

        const { eventName, bookingRequestId } = event;

        switch (eventName) {
            case EventNames.BookingConfirmed:
                await this.bookingRequestService.confirm(bookingRequestId);
                break;

            case EventNames.BookingRejected:
                await this.bookingRequestService.reject(bookingRequestId);
                break;

            default:
                return;
        }

    }
}


