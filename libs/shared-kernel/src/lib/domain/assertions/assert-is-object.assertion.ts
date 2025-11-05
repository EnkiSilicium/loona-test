
export function assertIsObject(
  thing: unknown,
  description: string = 'Description was not provided - check stack traces for more details on this error',
): asserts thing is Record<string, unknown> {
  if (
    thing === null ||
    (typeof thing !== 'object' && typeof thing !== 'function')
  ) {
    // function is allowed because functions hathinge properties too
    throw new Error(
      `Something expected to be an object is not an object`
    );
  }
}
