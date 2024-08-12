import { HealthCheckError } from './HealthCheckError';

export class TimeoutError extends HealthCheckError {
  constructor(timeout: number) {
    super(`Timeout ${timeout}ms exceeded`);
  }
}
