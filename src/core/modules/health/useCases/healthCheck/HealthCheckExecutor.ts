import { Service } from '@/core/infrastructure/Container';
import { HealthIndicatorFunction } from '../healthIndicator/HealthIndicator';
import { HealthIndicatorResult } from '../healthIndicator/HealthIndicatorResult';
import { HealthCheckResult, HealthCheckStatus } from './HealthCheckResult';

@Service()
export class HealthCheckExecutor {
  async execute(
    healthIndicators: HealthIndicatorFunction[]
  ): Promise<HealthCheckResult> {
    const { results, errors } = await this.executeHealthIndicators(healthIndicators);

    return await this.getResults(results, errors);
  }

  private async executeHealthIndicators(
    healthIndicators: HealthIndicatorFunction[]
  ) {
    const results: HealthIndicatorResult[] = [];
    const errors: HealthIndicatorResult[] = [];

    const result = await Promise.allSettled(
      healthIndicators.map(async (h) => h())
    );

    result.forEach((res) => {
      if (res.status === 'fulfilled') {
        results.push(res.value);
      } else {
        const error = res.reason;
        errors.push(error);
      }
    });

    return { results, errors };
  }

  private async getResults(
    results: HealthIndicatorResult[],
    errors: HealthIndicatorResult[],
  ): Promise<HealthCheckResult> {
    const infoErrorCombained = results.concat(errors);

    const details = this.getSummary(infoErrorCombained);

    let status: HealthCheckStatus = 'ok';
    status = errors.length > 0 ? 'error' : status;

    return {
      status,
      details
    }
  }

  private getSummary(results: HealthIndicatorResult[]): HealthIndicatorResult {
    return results.reduce(
      (prev: any, curr: any) => Object.assign(prev, curr),
      {}
    );
  }
}
