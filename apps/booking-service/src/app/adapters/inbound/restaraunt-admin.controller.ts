// apps/booking-service/src/app/api/restaurant-admin.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantAdminService } from 'apps/booking-service/src/app/application/restaraunt-admin-service';
import { DiningTableInit, DiningTable } from 'apps/booking-service/src/app/domain/dining-table.entity';
import { RestaurantInit, Restaurant } from 'apps/booking-service/src/app/domain/restaraunt.entity';
import { RestaurantResponseDto, CreateRestaurantRequestDto, DiningTableResponseDto, CreateDiningTableRequestDto } from 'contracts';

@ApiTags('Admin: Restaurants')
@Controller('admin/restaurants')
export class RestaurantAdminController {
  constructor(private readonly app: RestaurantAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a restaurant' })
  @ApiCreatedResponse({ type: RestaurantResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async createRestaurant(
    @Body() dto: CreateRestaurantRequestDto,
  ): Promise<RestaurantResponseDto> {
    const init: RestaurantInit = {
        restarauntName: dto.name
    };
    return await this.app.createRestaurant(init);
  }

  @Get()
  @ApiOperation({ summary: 'List restaurants' })
  @ApiOkResponse({ type: RestaurantResponseDto, isArray: true })
  async listRestaurants(): Promise<RestaurantResponseDto[]> {
    const listings = await this.app.listRestaurants();
    return listings
  }

  @Post(':restaurantId/tables')
  @ApiOperation({ summary: 'Add a dining table to a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant UUID v4',
    example: '8ccf7b0b-2a4e-4a5a-a1c1-b8d1d0f0c0aa',
  })
  @ApiCreatedResponse({ type: DiningTableResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Restaurant not found' })
  async addTable(
    @Param('restaurantId', new ParseUUIDPipe({ version: '4' })) restaurantId: string,
    @Body() dto: CreateDiningTableRequestDto,
  ): Promise<void> {
    const init: DiningTableInit = {
      restarauntId: restaurantId,
      capacity: dto.capacity,
      tableNumber: dto.tableNumber
    };
    await this.app.addTable(init);
  }

  @Get(':restaurantId/tables')
  @ApiOperation({ summary: 'List dining tables of a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant UUID v4',
    example: '8ccf7b0b-2a4e-4a5a-a1c1-b8d1d0f0c0aa',
  })
  @ApiOkResponse({ type: DiningTableResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Restaurant not found' })
  async listTables(
    @Param('restaurantId', new ParseUUIDPipe({ version: '4' })) restaurantId: string,
  ): Promise<DiningTableResponseDto[]> {
    const tables = await this.app.listTables(restaurantId);
    return tables
  }
}
