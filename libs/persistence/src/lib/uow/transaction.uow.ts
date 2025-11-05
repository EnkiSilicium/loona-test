import { Inject, Injectable, Logger } from "@nestjs/common";
import { BaseEvent } from "contracts";
import { getAmbient, als } from "libs/persistence/src/lib/helpers/require-tx-manager.helper";
import { MessageProducerPort } from "adapter";
import { Ambient } from "libs/persistence/src/lib/uow/uow-ambient.type.js";
import { DataSource, QueryRunner } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel.js";


export type Propagation = 'REQUIRED' | 'REQUIRES_NEW';

/**
 * Custom UoW supporting after/before commit hooks. Manages outbox as well:
 * call `enqueueOutbox` function to schedule events for dispatch if commited.
 */
@Injectable()
export class TypeOrmUoW {
  constructor(
    private readonly ds: DataSource,
    //private readonly publishJob: OutboxService,
    @Inject(MessageProducerPort)
    private readonly producer: MessageProducerPort<BaseEvent<string>>,
  ) { }

  async run<T>(
    context: Partial<
      Pick<Ambient, 'actorId' | 'correlationId' | 'nowIso'>
    > = {},
    fn: () => Promise<T>,
    opts?: { isolation?: IsolationLevel; propagation?: Propagation },
  ): Promise<T> {
    const parent: Ambient | undefined = getAmbient();
    const propagation: Propagation = opts?.propagation ?? 'REQUIRED';

    // If we already have a tx in ALS and propagation is REQUIRED, reuse it.
    if (parent?.manager && propagation === 'REQUIRED') {
      // Shallow-merge context into existing store; reuse arrays so hooks/outbox accumulate on the outer tx.
      const merged: Ambient = {
        ...parent,
        ...context,
        manager: parent.manager,
        beforeCommit: parent.beforeCommit ?? [],
        afterCommit: parent.afterCommit ?? [],
        outboxBuffer: parent.outboxBuffer ?? [],
      };
      return await als.run(merged, fn);
    }

    // Otherwise, open a new transaction (outermost or REQUIRES_NEW)
    let qr: QueryRunner;
    try {
      //connection
      qr = this.ds.createQueryRunner();
      await qr.connect();
      await qr.startTransaction(opts?.isolation ?? 'READ COMMITTED');
    } catch (error: any) {
      throw error
      //remapTypeOrmPgErrorToInfra(error);
    }

    const store: Ambient = {
      ...(parent ?? {}),
      ...context,
      manager: qr.manager,
      beforeCommit: [],
      afterCommit: [],
      outboxBuffer: [],
    };

    try {
      //happy path
      const result = await als.run(store, async () => {
        return await fn();
      });

      //  beforeCommit hooks
      for (const cb of store.beforeCommit!) await cb();

      // persist staged outbox messages inside the tx
      let rows: BaseEvent<string>[] | undefined = store.outboxBuffer;

      await qr.commitTransaction();

      //  afterCommit hooks (publish staged messages)
      if (store.outboxBuffer!.length) {
        this.producer
          .dispatch(rows)
          .then(() => {
            //closing statement
          })
          .catch(async (error) => {
            Logger.warn({
              message: `Publish failed: ${error?.message ?? 'unknown reason'}, retrying...`,
              meta: {
                error,
                producer: `${(this.producer as any)?.name ?? 'unspecified'}`,
              },
            });
            this.producer
              .dispatch(rows)
              .then(() => {
                //closing statement
              })

            try {
              // await this.publishJob.enqueuePublish({
              //   events: rows.map((r) => r.payload),
              //   outboxIds: messageIds,
              // });
            } catch (error) {
              Logger.error({
                message: `Backup publisher failed: ${(error as Error)?.message ?? 'unknown reason'}.`,
                meta: { error },
              });
            }
          });
      }

      for (const cb of store.afterCommit!) await cb();

      return result;
    } catch (error) {
      //unhappy path
      await qr.rollbackTransaction().catch(() => {
        Logger.warn({ message: `Transaction rollback failed!` });
      });
      throw error
      //remapTypeOrmPgErrorToInfra(error as Error);
    } finally {
      // todo: should consider restart mechanism for the service, or at least datasource.
      await qr.release().catch(() => {
        Logger.warn({ message: `Transaction release failed!` });
      });
    }
  }
}
