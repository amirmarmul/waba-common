import { Container } from '@/core/infrastructure/Container';
import { Worker as WorkerContract } from '@/core/domain/events/Worker';
import { Listener as ListenerContract } from '@/core/domain/events/Listener';
import { Listener } from './Listener';
import logger from '@/core/utils/logger';

export class Worker implements WorkerContract {
  protected listeners: ListenerContract[] = [];

  constructor(listeners: any[]) {
    this.registerListeners(listeners);
  }

  protected registerListeners(listeners: any[]) {
    listeners.forEach((listener) => {
      const instance = this.resolve(listener);
      this.listeners.push(instance);
    });
  }

  protected resolve(klass: any): ListenerContract {
    if (klass instanceof Listener) {
      return klass;
    }
    return Container.get<ListenerContract>(klass);
  }

  start(): void {
    logger.info('Register listeners %s', this.listeners);
    for (const listener of this.listeners) {
      listener.init().listen();
    }
  }
}
