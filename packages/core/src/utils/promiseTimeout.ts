const createPromiseWithTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  actionName: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(`${actionName} timed out after ${timeoutMs} milliseconds`)
      );
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
};
