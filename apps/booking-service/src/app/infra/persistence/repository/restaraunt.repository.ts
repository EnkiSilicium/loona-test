import { Injectable, NotFoundException } from '@nestjs/common';
import { requireTxManager } from 'persistence';
import { assertValid } from 'shared-kernel';
import { Repository } from 'typeorm';
import { Restaurant } from '../../../domain/restaraunt.entity';


@Injectable()
export class RestaurantRepository {
  private repo(): Repository<Restaurant> {
    return requireTxManager().getRepository(Restaurant);
  }

  async save(entity: Restaurant): Promise<Restaurant> {
    return this.repo().save(entity);
  }

  async findById(restarauntId: string): Promise<Restaurant | null> {
    return this.repo().findOne({ where: { restarauntId } });
  }

  async requireById(restarauntId: string): Promise<Restaurant> {
    const e = await this.findById(restarauntId);
    if (!e) throw new NotFoundException({ message: 'Restaurant not found', restarauntId });
    return e;
  }

  async list(): Promise<Restaurant[]> {
    return this.repo().find();
  }

  async updateName(restarauntId: string, restarauntName: string): Promise<Restaurant> {
    const e = await this.requireById(restarauntId);
    e.restarauntName = restarauntName;
    assertValid(e);
    return this.repo().save(e);
  }

  async delete(restarauntId: string): Promise<void> {
    await this.repo().delete({ restarauntId });
  }
}
