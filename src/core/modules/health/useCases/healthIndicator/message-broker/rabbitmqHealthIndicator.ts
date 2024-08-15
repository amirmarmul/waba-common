import { HealthIndicatorResult } from '../HealthIndicatorResult';
import { HealthIndicator } from '../HealthIndicator';
import { ConnectionNotFoundError } from '../../../errors/ConnectionNotFoundError';
import { TimeoutError } from '../../../errors/TimeoutError';
import { HealthCheckError } from '../../../errors/HealthCheckError';
import { promiseTimeout } from '../../../utils/promise';
import { Connection } from '@/core/infrastructure/events/Connection';
import { Service } from '@/core/infrastructure/Container';

export interface RabbitmqPingCheckOptions {
  connection?: any;
  /**
   * The amount of time the check should require in ms
   */
  timeout?: number;
}

@Service()
export class RabbitmqHealthIndicator extends HealthIndicator {
  /**
   * Checks if the RabbitMQ responds in (default) 1000ms and
   * returns a result object corresponding to the result
   * 
   * @example
   * rabbitmqHealthIndicator.pingCheck('rabbitmq', { timeout: 1000 });
   */
  async pingCheck(
    key: string,
    options?: RabbitmqPingCheckOptions
  ): Promise<HealthIndicatorResult> {
    let isHealthy = false;

    const connection = options?.connection || this.getContextConnection();
    const timeout = options?.timeout || 1000;

    if (!connection) {
      throw new ConnectionNotFoundError();
    }

    try {
      await this.pingMQ(connection, timeout);
      isHealthy = true;
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new TimeoutError(timeout);
      }
    }

    if (isHealthy) {
      return this.getStatus(key, isHealthy);
    } else {
      throw this.getStatus(key, isHealthy, {
        error: new HealthCheckError(`${key} is not available`).message
      });
    }
  }

  private async pingMQ(connection: any, timeout: number) {
    const promise = connection.isConnected() ? Promise.resolve() : Promise.reject();
    return await promiseTimeout(timeout, promise);
  }

  private getContextConnection(): any | null {
    try {
      return Connection.getConnection();
    } catch (error) {
      return null;
    }
  }
}
