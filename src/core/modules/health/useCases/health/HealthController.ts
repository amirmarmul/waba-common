import { Container, Service } from '@/core/infrastructure/Container';
import { Controller } from '@/core/infrastructure/Controller';
import { Request, Response } from 'express';
import { HealthCheck } from '../healthCheck/HealthCheck';
import { MongooseHealthIndicator } from '../healthIndicator/database/mongooseHealthIndicator';
import { SequelizeHealthIndicator } from '../healthIndicator/database/sequelizeHealthIndicator';
import { RabbitmqHealthIndicator } from '../healthIndicator/message-broker/rabbitmqHealthIndicator';
import { HealthIndicatorFunction } from '../healthIndicator/HealthIndicator';
import { sendSuccessResponse } from '@/core/utils/response';

@Service()
export default class HealthController extends Controller {
  constructor(
    private readonly health: HealthCheck,
    protected readonly mongoose: MongooseHealthIndicator,
    protected readonly rabbitmq: RabbitmqHealthIndicator,
    protected readonly sequelize: SequelizeHealthIndicator,
  ) {
    super();
  }

  registerRoutes(): void {
    this.router.get('/health', this.show.bind(this));
  }

  async show(req: Request, res: Response) {
    try {
      const services = this.getHealthServices();
      const data = await this.health.check(services);
      return this.ok(res, data);
    } catch (error: any) {
      return sendSuccessResponse(res, error, 500);
    }
  }

  protected getHealthServices(): HealthIndicatorFunction[] {
    const services = [];
    const health = Container.get<any>('health');

    if (health?.rmq) {
      services.push(...this.rmqPingCheck());
    }

    if (health?.mongo) {
      services.push(...this.mongoPingCheck());
    }

    if (health?.mysql) {
      services.push(...this.sequelizePingCheck());
    }

    return services;
  }

  protected rmqPingCheck(): HealthIndicatorFunction[] {
    return [async () => this.rabbitmq.pingCheck('rmq')];
  }

  protected mongoPingCheck(): HealthIndicatorFunction[] {
    return [async () => this.mongoose.pingCheck('mongo')];
  }

  protected sequelizePingCheck(): HealthIndicatorFunction[] {
    return [async () => this.sequelize.pingCheck('mysql')];
  }
}
