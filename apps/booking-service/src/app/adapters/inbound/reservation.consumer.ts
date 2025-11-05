import {
    Controller,
    UseInterceptors,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TableBookingService } from 'apps/booking-service/src/app/application/table-booking.service';
import { KafkaTopics, EventNames } from 'contracts';
import type { BaseEvent } from 'contracts';
import { LoggingInterceptor } from 'observability';
import { assertIsBookingEvent, assertIsObject, } from 'shared-kernel';

@Controller()
export class ReservationConsumer {
    constructor(private readonly tableBookingService: TableBookingService) { }

    @UseInterceptors(LoggingInterceptor)
    @EventPattern(KafkaTopics.Booking)
    async onOrderTransitions(@Payload() payload: BaseEvent<string>) {
        await this.route({ ...payload });
    }

    // If event is invalid, it's detected at the application/domain layer.
    private async route(event: BaseEvent<string>): Promise<void> {
        assertIsObject(event);
        assertIsBookingEvent(event)

        const { eventName } = event;

        switch (eventName) {
            case EventNames.BookingCreated:
                await this.tableBookingService.tryPlaceBookingFromRequest({
                    amountOfGuests: event?.amountOfGuests as number, //caught by domain validation later
                    bookAt: event?.bookAt as string,
                    bookingRequestId: event.bookingRequestId,
                    restarauntId: event?.restarauntId as string

                });
                break;

            default:
                return;
        }

    }
}


