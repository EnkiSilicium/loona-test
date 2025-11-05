import { ApiProperty } from "@nestjs/swagger";
import { EventNames } from "libs/contracts/src/_common/event-names.enum";

export class BookingConfirmedEvent {
  @ApiProperty({
    description:
      'Event name string. Allowed values (documented only): "BookingConfirmed".',
    example: 'BookingConfirmed',
  })
  eventName!: EventNames.BookingConfirmed;

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
    example: '5b3c2a1d-4e6f-7a8b-9c0d-1e2f3a4b5c6d',
  })
  eventId!: string;

  @ApiProperty({
    description: 'Event creation time (ISO-8601).',
    format: 'date-time',
    example: new Date().toISOString(),
  })
  createdAt!: string;
}

export class BookingRejected {
  @ApiProperty({
    description:
      'Event name string. Allowed values (documented only): "BookingRejected".',
    example: 'BookingRejected', // note: documented as rejected here
  })
  eventName!: EventNames.BookingRejected;

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
    example: '1c2d3e4f-5a6b-7c8d-9e0f-a1b2c3d4e5f6',
  })
  eventId!: string;

  @ApiProperty({
    description: 'Event creation time (ISO-8601).',
    format: 'date-time',
    example: new Date().toISOString(),
  })
  createdAt!: string;
}