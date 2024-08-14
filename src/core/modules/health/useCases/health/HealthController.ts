import { Request, Response } from 'express';
import { HealthCheck } from '../healthCheck/HealthCheck';
import { MongooseHealthIndicator } from '../healthIndicator/database/mongooseHealthIndicator';
import { RabbitmqHealthIndicator } from '../healthIndicator/message-broker/rabbitmqHealthIndicator';
import { Controller } from '@/core/infrastructure/Controller';
import { Container, Service } from '@/core/infrastructure/Container';
import { SequelizeHealthIndicator } from '../healthIndicator/database/sequelizeHealthIndicator';
import mongoose from 'mongoose';
import logger from '@/core/utils/logger';

@Service()
export default class HealthController extends Controller {
  constructor(
    private readonly health: HealthCheck,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly rabbitmq: RabbitmqHealthIndicator,
    private readonly sequelize: SequelizeHealthIndicator,
  ) {
    super();
  }

  registerRoutes(): void {
    this.router.get('/health', this.show.bind(this));
  }

  async show(req: Request, res: Response) {
    const services = this.getHealthServices();
    const data = await this.health.check(services);

    return this.ok(res, data);
  }

  protected getHealthServices() {
    const services = [];
    const health = Container.get<any>('health');

    if (health?.rmq) {
      services.push(async () => this.rabbitmq.pingCheck('rmq'));
    }

    if (health?.mongo) {
      logger.info({ mongooseConnLength: mongoose.connections.length });
      mongoose.connections.forEach((connection: any) => {
        // if (!connection?._connectionString) return;
        const dbName = connection?.client?.s?.options?.dbName;
        logger.info({ dbName, connection });
        services.push(async () => this.mongoose.pingCheck('mongo.' + dbName, { connection }));
      });
    }

    if (health?.mysql) {
      services.push(async () => this.sequelize.pingCheck('mysql'));
    }

    return services;
  }
}
