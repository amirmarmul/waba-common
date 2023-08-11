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
    this.connection = amqp.connect([ process.env.APP_MQ! ]);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel) => this.setup(channel)
    });

    this.payload = payload;
  }

  public setup(channel: Channel): void {
    channel.assertExchange(this.exchange, 'topic', { durable: false });
  }

  public publish() {
    return this.channel.publish(this.exchange, this.topic, this.payload);
  }
}
