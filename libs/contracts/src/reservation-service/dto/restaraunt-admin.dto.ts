// apps/booking-service/src/app/api/restaurant-admin.dtos.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRestaurantRequestDto {
  @ApiProperty({
    description: 'Display name of the restaurant',
    example: 'Central Kitchen',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Optional short description',
    example: 'Modern menu with seasonal ingredients',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RestaurantResponseDto {
  @ApiProperty({
    description: 'Restaurant identifier (UUID v4)',
    example: '8ccf7b0b-2a4e-4a5a-a1c1-b8d1d0f0c0aa',
  })
  restarauntId!: string;
}

export class CreateDiningTableRequestDto {
  @ApiProperty({
    description: 'Number of seats the table provides (integer ≥ 1)',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({
    description: 'Table number',
    example: '1',
    required: true,
  })
  @IsOptional()
  @IsString()
  tableNumber!: number;
}

export class DiningTableResponseDto {
  @ApiProperty({ description: 'Seating capacity', example: 4, minimum: 1 })
  capacity!: number;
}
