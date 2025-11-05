import { Logger } from '@nestjs/common';
import { assertInsideTransaction, getAmbient } from 'libs/persistence/src/lib/helpers/require-tx-manager.helper';
import { BaseEvent } from 'contracts'

const logger = new Logger('OutboxEnqueue');

/**
 * Puts domain events into outbox.
 *
 * Those are committed as a part of the transaction and flushed into kafka after commit.
 * Runs BEFORE beforeCommit
 *
 * @param message what to put in outbox
 */
export function enqueueOutbox<e extends BaseEvent<string>>(
  message: e,
) {
  logger.debug({
    message: 'Attempt: Enqueue event into outbox',
    meta: {
      eventName: message.eventName,
    },
  });

  const ambient = getAmbient();
  const ensure = 'outboxBuffer';
  const whenCalledFrom = enqueueOutbox.name;

  assertInsideTransaction(ambient, ensure, whenCalledFrom);

  ambient.outboxBuffer.push(message);

  logger.debug({
    message: 'Success: Enqueued event into outbox',
    meta: {
      eventName: message.eventName,
      pendingEventCount: ambient.outboxBuffer.length,
    },
  });
}