import type { BaseEvent } from "contracts";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'outbox_message' })
export class OutboxMessage<event extends BaseEvent<string>> {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column('jsonb', { name: 'payload' })
  payload!: BaseEvent<event['eventName']>;

  //@IsISO8601()
  @Column({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: string;
}