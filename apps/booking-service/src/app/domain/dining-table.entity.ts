import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToMany,
  JoinColumn, CreateDateColumn, UpdateDateColumn, Check, Index
} from 'typeorm';
import { IsUUID, IsInt, Min } from 'class-validator';
import { assertValid } from 'shared-kernel';
import { Booking } from './booking-entity';
import { Restaurant } from './restaraunt.entity';

export type DiningTableInit = {
  restarauntId: string;
  tableNumber: number;
  capacity: number;
};

@Entity({ name: 'restaurant_table' })
@Check(`"capacity" >= 1`)
@Index(['restarauntId'])
export class DiningTable {
  @PrimaryColumn('uuid', { name: 'restarauntId' })
  @IsUUID()
  restarauntId!: string;

  @PrimaryColumn('int', { name: 'tableNumber' })
  @IsInt()
  @Min(1)
  tableNumber!: number;

  @Column('int', { name: 'capacity' })
  @IsInt()
  @Min(1)
  capacity!: number;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Restaurant, r => r.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restarauntId', referencedColumnName: 'restarauntId' })
  restaurant!: Restaurant;

  @OneToMany(() => Booking, b => b.table, { cascade: false })
  bookings?: Booking[];

  constructor(init?: DiningTableInit) {
    if (init) {
      this.restarauntId = init.restarauntId;
      this.tableNumber = init.tableNumber;
      this.capacity = init.capacity;
      assertValid(this);
    }
  }
}
