import { BaseEvent } from "contracts";
import { EntityManager } from "typeorm";

/**
 * Transaction context type - stored in async storage during UoW.
 */
export type Ambient = {
  reqId?: string;
  actorId?: string;
  correlationId?: string;
  nowIso?: string;

  manager?: EntityManager;
  beforeCommit?: Array<() => Promise<void> | void>;
  afterCommit?: Array<() => Promise<void> | void>;
  outboxBuffer?: BaseEvent<string>[]; // staged messages to persist+publish
};