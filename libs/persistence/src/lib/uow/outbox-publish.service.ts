import { Injectable, Logger } from "@nestjs/common";
import { BaseEvent } from "contracts";


@Injectable()
export class OutboxService {
  //constructor(@InjectQueue(OUTBOX_QUEUE) private readonly queue: Queue) {}

  async enqueuePublish(cmd: { events: BaseEvent<string>[]; outboxIds: string[] }) {
    Logger.verbose({
      message: `Publishing job enqued for events: ${cmd.events.join(` ,`)}`,
      meta: { outboxIds: cmd.outboxIds },
    });
  }
}
