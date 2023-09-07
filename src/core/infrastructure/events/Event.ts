import { logger } from '@/core';
import { Event as EventContract } from '@/core/domain/events/Event';
import amqp, { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
export { Channel, ChannelWrapper };

export abstract class Event<T> implements EventContract {
  protected connection: AmqpConnectionManager;
  protected channel: ChannelWrapper;
  protected payload: T;
  abstract exchange: string;
  abstract topic: string;

  constructor(payload: T) {
    this.connection = amqp.connect([process.env.APP_MQ!]);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel) => this.setup(channel)
    });

    this.payload = payload;
  }

  protected setup(channel: Channel): void {
    channel.assertExchange(this.exchange, 'topic', { durable: false });
  }

  public async publish() {
    logger.info('Publish message %s', this.constructor.name);
    const result = await this.channel.publish(this.exchange, this.topic, this.payload);
    await this.close();
    return result;
  }

  protected async close() {
    setTimeout(async () => {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    }, 500)
  }
}