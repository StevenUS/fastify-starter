export function handleDbError(
  error: unknown,
  context: Record<string, unknown> = {},
  message = 'Database operation failed',
): Error {
  if (error instanceof Error) {
    console.error(`${message}:`, {
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
      ...context,
    });
  } else {
    console.error(`(unhandeld error) ${message}:`, error, context);
  }

  const wrappedError = new Error((error as Error).message || message);
  wrappedError.cause = error instanceof Error ? error : undefined;
  return wrappedError;
}
