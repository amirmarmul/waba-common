
import { HealthIndicatorResult } from '../HealthIndicatorResult';
import { HealthIndicator } from '../HealthIndicator';
import { ConnectionNotFoundError } from '../../../errors/ConnectionNotFoundError';
import { HealthCheckError } from '../../../errors/HealthCheckError';
import { promiseTimeout } from '../../../utils/promise';
import { TimeoutError } from '../../../errors/TimeoutError';
import { Container, Service } from '@/core/infrastructure/Container';
import { Sequelize } from 'sequelize';

export interface SequelizePingCheckOptions {
  connection?: any;
  /**
   * The amount of time the check should require in ms
   */
  timeout?: number;
}

@Service()
export class SequelizeHealthIndicator extends HealthIndicator {
  /**
   * Checks if the MongoDB responds in (default) 1000ms and
   * returns a result object corresponding to the result
   * 
   * @example
   * mongooseHealthIndicator.pingCheck('mongodb', { timeout: 1000 });
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
    const promise = connection.getConnection({ type: 'read' }) ? Promise.resolve() : Promise.reject();
    return await promiseTimeout(timeout, promise);
  }

  private getContextConnection(): any | null {
    try {
      const MySQLDB = Container.get<string>('MYSQL_DB');
      const sequelize = new Sequelize(MySQLDB, { dialect: 'mysql' });
      return sequelize.connectionManager;
    } catch (error) {
      return null;
    }
  }
}
