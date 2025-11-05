import { inspect } from "util";

export function assertIsBookingEvent(
    event: Record<string, unknown>,
): asserts event is { eventName: string; bookingRequestId: string } {
    if (
        !Object.keys(event).includes(`eventName`) ||
        !Object.keys(event).includes(`bookingRequestId`) ||
        typeof (event as any).eventName !== 'string' ||
        typeof (event as any).bookingRequestId !== 'string'

    ) {
        throw Error(`Invalid event: ${inspect(event)}`);
    }
}