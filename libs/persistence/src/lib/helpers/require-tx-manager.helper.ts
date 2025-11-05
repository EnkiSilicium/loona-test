import { HttpException, HttpStatus } from "@nestjs/common";
import { Ambient } from "libs/persistence/src/lib/uow/uow-ambient.type.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { EntityManager } from "typeorm";

/**
 *
 *
 * @param ds typeorm DataSource
 * @returns EntityManager of the current transaction.
 * @throws if outside of UoW transaction.
 */
export function requireTxManager(): EntityManager {
  const ambient = getAmbient();

  const ensure = 'manager';
  const whenCalledFrom = requireTxManager.name;

  assertInsideTransaction(ambient, ensure, whenCalledFrom);

  return ambient.manager;
}

export const als = new AsyncLocalStorage<Ambient>();
/**
 * Syntactic sugar to get the als of the current transaction.
 *
 * @returns als ambient storage or undefined if outside of active UoW transaction.
 */
export function getAmbient(): Ambient | undefined {
  return als.getStore() ?? undefined;
}

export function assertInsideTransaction<K extends keyof Ambient>(
  ambient: Ambient | undefined,
  ensure: K,
  whenCalledFrom: string,
): asserts ambient is Ambient & {
  [P in K]-?: NonNullable<Ambient[P]>;
} {
  if (!ambient || !ambient[ensure]) {
    throw new HttpException('Unit of work transaction is not active.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
