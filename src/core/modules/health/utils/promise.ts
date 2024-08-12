import { TimeoutError } from '../errors/TimeoutError';

export const promiseTimeout = function (
  ms: number,
  promise: Promise<any>,
): Promise<any> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise,
    new Promise(
      (_, reject) =>
        (timer = setTimeout(
          () => reject(new TimeoutError(ms)),
          ms,
        )),
    ),
  ]).finally(() => clearTimeout(timer));
};