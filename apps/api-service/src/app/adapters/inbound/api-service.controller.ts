import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BookingRequestService } from 'apps/api-service/src/app/application/booking-request.service';
import { PostBookingResponseDto, PostBookingRequestDto, GetBookingResponseDto, GetBookingRequestDto } from 'contracts';


@ApiTags('booking')
@Controller()
export class ApiServiceController {
  constructor(
    private readonly bookingRequestService: BookingRequestService,
  ) {}

  @Post('booking')
  @ApiOperation({ summary: 'Create a booking request' })
  @ApiOkResponse({ type: PostBookingResponseDto })
  async postBooking(
    @Body() dto: PostBookingRequestDto,
  ): Promise<PostBookingResponseDto> {
    return this.bookingRequestService.create({...dto});
  }

  @Get('booking')
  @ApiOperation({ summary: 'Get booking snapshot by bookingId' })
  @ApiOkResponse({ type: GetBookingResponseDto })
  async getBooking(
    @Query() dto: GetBookingRequestDto,
  ): Promise<GetBookingResponseDto | null> {
    return this.bookingRequestService.read(dto.bookingId);
  }
}
