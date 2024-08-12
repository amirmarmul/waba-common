import { HealthCheckError } from './HealthCheckError';

export class ConnectionNotFoundError extends HealthCheckError {
  constructor() {
    super('Connection provider not found in application context');
  }
}
