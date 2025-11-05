import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    JoinColumn, CreateDateColumn, UpdateDateColumn, Check, Index
} from 'typeorm';
import {
    IsUUID, IsInt, Min, IsISO8601, Validate, IsEnum, IsOptional
} from 'class-validator';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BookingStatusEnum } from './booking-status.enum';
import { assertValid } from 'shared-kernel'


export type BookingRequestInit = {
    restarauntId: string;
    /** ISO-8601 string, whole-hour aligned, strictly future */
    bookAt: string;
    amountOfGuests: number;
};


@Entity({ name: 'booking_request' })
@Check(`"amountOfGuests" >= 1`)
@Index(['restarauntId', 'bookAt'])
export class BookingRequest {
    @PrimaryGeneratedColumn('uuid', { name: 'bookingRequestId' })
    @IsUUID()
    @IsOptional()
    bookingRequestId!: string;

    @Column('uuid', { name: 'restarauntId' })
    @IsUUID()
    restarauntId!: string;

    @Column('text', { name: 'bookAt' })
    @IsISO8601({ strict: true })
    bookAt!: string;

    @Column('int', { name: 'amountOfGuests' })
    @IsInt()
    @Min(1)
    amountOfGuests!: number;

    @Column({ name: 'status', type: 'text' })
    @IsEnum(BookingStatusEnum)
    status!: string;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
    updatedAt!: Date;


    constructor(init?: BookingRequestInit) {
        if (init) {
            this.restarauntId = init.restarauntId;
            this.bookAt = init.bookAt;
            this.amountOfGuests = init.amountOfGuests;
            this.status = BookingStatusEnum.Created; 
            assertValid(this);
        }
    }

    confirm(): void {
        this.assertTransitionValid(BookingStatusEnum.Confirmed);
        this.status = BookingStatusEnum.Confirmed;
    }

    reject(): void {
        this.assertTransitionValid(BookingStatusEnum.Rejected);
        this.status = BookingStatusEnum.Rejected;
    }

    private assertTransitionValid(target: BookingStatusEnum): void {
        if (this.status !== BookingStatusEnum.Created) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.CONFLICT,
                    error: 'InvalidStatusTransition',
                    message: `Invalid transition: ${this.status} → ${target}`,
                    details: { from: this.status, to: target, entity: 'BookingRequest' },
                },
                HttpStatus.CONFLICT
            );
        }
    }
}
