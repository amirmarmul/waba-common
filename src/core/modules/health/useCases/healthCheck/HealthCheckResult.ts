import { HealthIndicatorResult } from '../healthIndicator/HealthIndicatorResult';

export type HealthCheckStatus = 'error' | 'ok' | 'shutdown';

export interface HealthCheckResult {
  status: HealthCheckStatus;
  details: HealthIndicatorResult;
}