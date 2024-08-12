import { HealthIndicatorResult } from './HealthIndicatorResult';

export type HealthIndicatorFunction = () => 
  | Promise<HealthIndicatorResult>
  | HealthIndicatorResult;

export abstract class HealthIndicator {
  protected getStatus(
    key: string,
    isHealthy: boolean,
    data?: { [key: string]: any }
  ): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data
      }
    }
  }
}
