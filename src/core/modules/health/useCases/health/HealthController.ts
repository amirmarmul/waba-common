import { Container, Service } from '@/core/infrastructure/Container';
import { Controller } from '@/core/infrastructure/Controller';
import logger from '@/core/utils/logger';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HealthCheck } from '../healthCheck/HealthCheck';
import { MongooseHealthIndicator } from '../healthIndicator/database/mongooseHealthIndicator';
import { SequelizeHealthIndicator } from '../healthIndicator/database/sequelizeHealthIndicator';
import { RabbitmqHealthIndicator } from '../healthIndicator/message-broker/rabbitmqHealthIndicator';

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
      services.push(this.rmqPingCheck());
    }

    if (health?.mongo) {
      services.push(this.mongoPingCheck());
    }

    if (health?.mysql) {
      services.push(this.sequelizePingCheck());
    }

    return services;
  }

  protected rmqPingCheck() {
    return async () => this.rabbitmq.pingCheck('rmq');
  }

  protected mongoPingCheck() {
    return async () => this.mongoose.pingCheck('mongo');
  }

  protected sequelizePingCheck() {
    return async () => this.sequelize.pingCheck('mysql');
  }
}
