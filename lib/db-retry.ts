function isTransientDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return [
    "Connection terminated unexpectedly",
    "ECONNRESET",
    "ETIMEDOUT",
    "Can't reach database server",
    "Connection closed"
  ].some((text) => message.includes(text));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDbRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDatabaseError(error) || attempt === retries) {
        throw error;
      }

      await wait(180 * (attempt + 1));
    }
  }

  throw lastError;
}
