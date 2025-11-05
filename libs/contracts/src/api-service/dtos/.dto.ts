import { ApiProperty } from "@nestjs/swagger";

export class PostBookingRequestDto {
    @ApiProperty({
        description: 'Restaurant identifier (UUID string).',
        format: 'uuid',
        example: '2f7a9e0b-2c10-4f5e-8a2c-3b5d8f5e9a11',
    })
    restarauntId!: string;

    @ApiProperty({
        description:
            'ISO-8601 timestamp at whole-hour granularity (e.g., 18:00, 19:00...). Must be in the future.',
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
}

export class PostBookingResponseDto {
    @ApiProperty({
        description: 'Booking Request identifier (UUID string).',
        format: 'uuid',
        example: '9f2a3b7e-7d3a-4c15-9e4c-4f1a2b3c4d5e',
    })
    bookingRequestId!: string;
}

export class GetBookingRequestDto {
    @ApiProperty({
        description:
            'Public booking identifier (UUID string). In this model it equals the bookingRequestId.',
        format: 'uuid',
        example: '9f2a3b7e-7d3a-4c15-9e4c-4f1a2b3c4d5e',
    })
    bookingId!: string;
}

export class GetBookingResponseDto {
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
        description:
            'Status string. Allowed values (documented only): "CREATED", "CONFIRMED", "REJECTED".',
        example: 'CREATED',
    })
    status!: string;

 
    // @ApiProperty({
    //     description: 'Table number assigned for the booking.',
    //     example: 7,
    //     minimum: 1,
    // })
    // tableNumber!: number;
}