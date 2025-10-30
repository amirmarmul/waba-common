
import { HealthIndicatorResult } from '../HealthIndicatorResult';
import { HealthIndicator } from '../HealthIndicator';
import { ConnectionNotFoundError } from '../../../errors/ConnectionNotFoundError';
import { HealthCheckError } from '../../../errors/HealthCheckError';
import { promiseTimeout } from '../../../utils/promise';
import { TimeoutError } from '../../../errors/TimeoutError';
import { Container, Service } from '@/core/infrastructure/Container';
import { Sequelize } from 'sequelize';

export interface SequelizePingCheckOptions {
  connection?: Sequelize;
  /**
   * The amount of time the check should require in ms
   */
  timeout?: number;
}

@Service()
export class SequelizeHealthIndicator extends HealthIndicator {
  /**
   * Checks if the MySQL/PostgreSQL database responds in (default) 1000ms
   * Uses existing connection pool, does NOT create new connections
   *
   * @example
   * sequelizeHealthIndicator.pingCheck('mysql', { timeout: 1000 });
   */
  async pingCheck(
    key: string,
    options?: SequelizePingCheckOptions
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
      // Log error for debugging
      console.error(`Health check failed for ${key}:`, err);
    }

    if (isHealthy) {
      return this.getStatus(key, isHealthy);
    } else {
      throw this.getStatus(key, isHealthy, {
        error: new HealthCheckError(`${key} is not available`).message
      });
    }
  }

  /**
   * Ping database using existing connection pool
   * Uses Sequelize.authenticate() which executes a simple query (SELECT 1)
   * Does NOT create new database connections
   */
  private async pingDB(connection: Sequelize, timeout: number) {
    const promise = connection.authenticate();
    return await promiseTimeout(timeout, promise);
  }

  private getContextConnection(): Sequelize | null {
    try {
      const sequelize = Container.get<Sequelize>('sequelize');
      return sequelize;
    } catch (error) {
      return null;
    }
  }
}
