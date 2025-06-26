export function handleDbError(error, context = {}, message = 'Database operation failed') {
    if (error instanceof Error) {
        console.error(`${message}:`, {
            message: error.message,
            code: error.code,
            stack: error.stack,
            ...context,
        });
    }
    else {
        console.error(`(unhandeld error) ${message}:`, error, context);
    }
    const wrappedError = new Error(error.message || message);
    wrappedError.cause = error instanceof Error ? error : undefined;
    return wrappedError;
}
//# sourceMappingURL=util.js.map