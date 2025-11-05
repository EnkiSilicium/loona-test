import { ApiProperty } from "@nestjs/swagger";
import { EventNames } from "libs/contracts/src/_common/event-names.enum";

export class BookingRequestCreatedEvent {
  @ApiProperty({
    description:
      'Event name string. Allowed values (documented only): "BookingCreated".',
    example: 'BookingCreated',
  })
  eventName!: EventNames.BookingCreated;

  @ApiProperty({
    description:
      'Public booking identifier (UUID string). In this model it equals the bookingRequestId.',
    format: 'uuid',
    example: '9f2a3b7e-7d3a-4c15-9e4c-4f1a2b3c4d5e',
  })
  bookingRequestId!: string;

  @ApiProperty({
    description: 'Restaurant identifier (UUID string).',
    format: 'uuid',
    example: '2f7a9e0b-2c10-4f5e-8a2c-3b5d8f5e9a11',
  })
  restarauntId!: string;

  @ApiProperty({
    description:
      'ISO-8601 timestamp at whole-hour granularity (e.g., 18:00, 19:00...).',
    format: 'date-time',
    example: '2025-11-04T18:00:00.000Z',
  })
  bookAt!: string;

  @ApiProperty({
    description: 'Number of guests (integer ≥ 1).',
    example: 2,
    minimum: 1,
  })
  amountOfGuests!: number;

  @ApiProperty({
    description: 'Schema version (constant 1 for now).',
    example: 1,
    minimum: 1,
  })
  schemaV!: number;

  @ApiProperty({
    description: 'Event identifier (UUID string).',
    format: 'uuid',
    example: '8a5b9d62-7e6b-4d4e-9c7f-f1e2a3b4c5d6',
  })
  eventId!: string;

  @ApiProperty({
    description: 'Event creation time (ISO-8601).',
    format: 'date-time',
    example: new Date().toISOString(),
  })
  createdAt!: string;
}