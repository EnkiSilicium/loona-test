import { Injectable } from '@nestjs/common';
import { DiningTableInit, DiningTable } from 'apps/booking-service/src/app/domain/dining-table.entity';
import { RestaurantInit, Restaurant } from 'apps/booking-service/src/app/domain/restaraunt.entity';
import { DiningTableRepository } from 'apps/booking-service/src/app/infra/persistence/repository/dining-table.repository';
import { RestaurantRepository } from 'apps/booking-service/src/app/infra/persistence/repository/restaraunt.repository';
import { TypeOrmUoW } from 'persistence';

@Injectable()
export class RestaurantAdminService {
  constructor(
    private readonly uow: TypeOrmUoW,
    private readonly restaurantRepo: RestaurantRepository,
    private readonly tableRepo: DiningTableRepository,
  ) {}

  async createRestaurant(init: RestaurantInit): Promise<{restarauntId: string}> {
    return this.uow.run({}, async () => {
      const entity = new Restaurant(init);
      const restaraunt = await this.restaurantRepo.save(entity);
      return {restarauntId: restaraunt.restarauntId}
    });
  }

  async listRestaurants(): Promise<Restaurant[]> {
    return this.uow.run({}, async () => {
      return await this.restaurantRepo.list();
    });
  }

  async addTable(init: DiningTableInit): Promise<void> {
    return this.uow.run({}, async () => {
      // ensure restaurant exists
      await this.restaurantRepo.requireById(init.restarauntId);
      const entity = new DiningTable(init);
      await this.tableRepo.save(entity);
    });
  }

  async listTables(restarauntId: string): Promise<DiningTable[]> {
    return this.uow.run({}, async () => {
      return await this.tableRepo.listByRestaurant(restarauntId);
    });
  }
}
