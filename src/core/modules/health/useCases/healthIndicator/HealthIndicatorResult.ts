export type HealthIndicatorStatus = 'up' | 'down';

export type HealthIndicatorResult = {
  [key: string]: {
    status: HealthIndicatorStatus,
    [key: string]: any;
  }
}
