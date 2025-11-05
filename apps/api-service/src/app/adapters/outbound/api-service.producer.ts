import { Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { MessageProducerPort, MQ_PRODUCER } from 'adapter';
import { TopicMap } from 'contracts'
import { assertIsObject } from 'shared-kernel';



export class KafkaMessageProducer<Msg extends { eventName: string; eventId?: string; schemaV?: number }>
  extends MessageProducerPort<Msg> {

  constructor(

    @Inject(MQ_PRODUCER) private readonly producer: ClientKafka,

  ) { super(); }

  async dispatch(events: Array<Msg> | undefined): Promise<void> {
    if (!events?.length) return;


    const batches = new Map<string, Array<{ key?: string; value: unknown; headers?: Record<string, string> }>>();

    for (const evt of events) {

      const topic = TopicMap[evt.eventName];
      assertIsObject(evt)
      const msg = {
        key: (evt as any)['bookingRequestId'] ?? evt.eventName, //todo: make the key a part of abstraction
        value: evt,
        headers: {
          'event-name': evt.eventName,
          'schema-v': String(evt.schemaV ?? 1),

        },
      };
      const arr = batches.get(topic);
      if (arr) arr.push(msg);
      else batches.set(topic, [msg]);
    }

    for (const [topic, messages] of batches) {
      for (const message of messages) {
        await this.producer.emit(topic, message);

      }

      Logger.log({
        message: `Emitted into ${topic} via ClientKafka`,
      });
    }

  }
}