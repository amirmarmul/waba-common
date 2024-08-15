
import { HealthIndicatorResult } from '../HealthIndicatorResult';
import { HealthIndicator } from '../HealthIndicator';
import mongoose from 'mongoose';
import { ConnectionNotFoundError } from '../../../errors/ConnectionNotFoundError';
import { HealthCheckError } from '../../../errors/HealthCheckError';
import { promiseTimeout } from '../../../utils/promise';
import { TimeoutError } from '../../../errors/TimeoutError';
import { Service } from '@/core/infrastructure/Container';

export interface MongoosePingCheckOptions {
  connection?: any;
  /**
   * The amount of time the check should require in ms
   */
  timeout?: number;
}

@Service()
export class MongooseHealthIndicator extends HealthIndicator {
  /**
   * Checks if the MongoDB responds in (default) 1000ms and
   * returns a result object corresponding to the result
   * 
   * @example
   * mongooseHealthIndicator.pingCheck('mongodb', { timeout: 1000 });
   */
  async pingCheck(
    key: string,
    options?: MongoosePingCheckOptions
  ): Promise<HealthIndicatorResult> {
    let isHealthy = false;

    const connection = options?.connection || this.getContextConnection();
    const timeout = options?.timeout || 1000;

    if (!connection) {
      throw new ConnectionNotFoundError();
    }

    try {
      await this.pingDB(connection, timeout);
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

  private async pingDB(connection: any, timeout: number) {
    const promise = connection.readyState === 1 ? Promise.resolve() : Promise.reject();
    return await promiseTimeout(timeout, promise);
  }

  private getContextConnection(): any | null {
    try {
      return mongoose.connection;
    } catch (error) {
      return null;
    }
  }
}
