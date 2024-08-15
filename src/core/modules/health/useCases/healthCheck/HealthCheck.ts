import { Service } from '@/core/infrastructure/Container';
import { HealthCheckError } from '../../errors/HealthCheckError';
import { HealthIndicatorFunction } from '../healthIndicator/HealthIndicator';
import { HealthCheckExecutor } from './HealthCheckExecutor';
import { HealthCheckResult } from './HealthCheckResult';

@Service()
export class HealthCheck {
  constructor(
    private readonly healthCheckExecutor: HealthCheckExecutor,
  ) {
    // 
  }

  async check(
    healthIndicators: HealthIndicatorFunction[]
  ): Promise<HealthCheckResult> {
    const result = await this.healthCheckExecutor.execute(healthIndicators);

    if (result.status === 'ok') {
      return result;
    }

    if (result.status === 'error') {
      throw result;
    }

    throw new HealthCheckError('Service Unavailable');
  }
}