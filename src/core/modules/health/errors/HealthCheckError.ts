export class HealthCheckError extends Error {
  constructor(message: string) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}
