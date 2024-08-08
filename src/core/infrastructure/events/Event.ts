import { logger } from '@/core';
import { Event as EventContract } from '@/core/domain/events/Event';
import { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';
import { ChannelEvent } from './ChannelEvent';
export { Channel, ChannelWrapper };

export abstract class Event<T> implements EventContract {
  protected connection: AmqpConnectionManager;
  protected channel: ChannelWrapper;
  protected priority: number;
  protected payload: T;
  abstract exchange: string;
  abstract topic: string;

  constructor(payload: T) {
    this.connection = Connection.getConnection();

    this.payload = payload;
    this.priority = 0;
  }

  init() {
    this.channel = ChannelEvent.getChannel();
    this.channel.addSetup(this.setup.bind(this));

    return this;
  }

  protected setup(channel: Channel): void {
    channel.assertExchange(this.exchange, 'topic', { durable: false });
  }

  public async publish(options = {}) {
    logger.debug('Publish message %s', this.constructor.name);
    const result = await this.channel.publish(this.exchange, this.topic, this.payload, Object.assign({
      deliveryMode: 2,
      persistent: true,
    }, options));
    // await this.close();
    return result;
  }

  /**
   * @deprecated
   */
  protected async close() {}
}
