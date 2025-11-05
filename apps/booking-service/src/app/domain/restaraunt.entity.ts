import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { IsUUID, IsString, Length, IsOptional } from 'class-validator';
import { assertValid } from 'shared-kernel';
import { DiningTable } from './dining-table.entity';

export type RestaurantInit = {
  restarauntName: string;
};

@Entity({ name: 'restaraunt' }) 
export class Restaurant {
  @PrimaryGeneratedColumn('uuid', { name: 'restarauntId' })
  @IsUUID()
  @IsOptional()
  restarauntId!: string;

  @Column({ name: 'restarauntName', type: 'text' })
  @IsString()
  @Length(1, 200)
  restarauntName!: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => DiningTable, t => t.restaurant, { cascade: false })
  tables?: DiningTable[];

  constructor(init?: RestaurantInit) {
    if (init) {
      this.restarauntName = init.restarauntName;
      assertValid(this);
    }
  }
}
