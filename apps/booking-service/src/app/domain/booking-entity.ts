import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn,
  Check, Index, Unique
} from 'typeorm';
import { IsUUID, IsInt, Min, IsISO8601, Validate } from 'class-validator';
import { DiningTable } from './dining-table.entity';
import { assertValid } from 'shared-kernel';

export type BookingInit = {
  restarauntId: string;
  tableNumber: number;
  /** ISO-8601 string, whole-hour aligned, strictly future */
  bookAt: string;
  amountOfGuests: number;
  /** Provided by caller; unique and FK to booking_request(bookingRequestId) */
  bookingRequestId: string;
};

@Entity({ name: 'booking' })
@Index(['restarauntId', 'bookAt'])
@Unique(['bookingRequestId']) // one Booking per bookingRequestId
export class Booking {
  @PrimaryColumn('uuid', { name: 'restarauntId' })
  @IsUUID()
  restarauntId!: string;

  @PrimaryColumn('int', { name: 'tableNumber' })
  @IsInt()
  @Min(1)
  tableNumber!: number;

  @PrimaryColumn('text', { name: 'bookAt' })
  @IsISO8601({ strict: true })
  bookAt!: string;

  @Column('int', { name: 'amountOfGuests' })
  @IsInt()
  @Min(1)
  amountOfGuests!: number;

  @Column('uuid', { name: 'bookingRequestId' })
  @IsUUID()
  bookingRequestId!: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => DiningTable, t => t.bookings, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'restarauntId', referencedColumnName: 'restarauntId' },
    { name: 'tableNumber', referencedColumnName: 'tableNumber' },
  ])
  table!: DiningTable;

  constructor(init?: BookingInit) {
    if (init) {
      this.restarauntId = init.restarauntId;
      this.tableNumber = init.tableNumber;
      this.bookAt = init.bookAt;
      this.amountOfGuests = init.amountOfGuests;
      this.bookingRequestId = init.bookingRequestId;
      assertValid(this);
    }
  }
}
