import { HttpException, HttpStatus } from '@nestjs/common';
import { validateSync } from 'class-validator';

export function assertValid(
  instance: object,
  groups: string[] | undefined = undefined,
): void {
  const groupsObject = groups ? { groups: groups } : {};

  const errors = validateSync(instance, {
    //those are very permissive - throw only iff constraint on the property
    //violated, does not modify the entity.
    whitelist: false,
    forbidNonWhitelisted: false,
    forbidUnknownValues: false,
    skipMissingProperties: false,
    skipUndefinedProperties: false,
    skipNullProperties: false,
    validationError: { target: true, value: true },
    ...groupsObject,
  });

  if (errors.length) {
    throw new HttpException(
      `Domain validation of ${(instance as any)?.name ?? 'unspecified entity'} rejected the values: ${errors}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
