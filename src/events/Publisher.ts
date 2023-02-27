import { Publisher as PublisherContract } from '../contracts/Publisher';
import amqp, { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

abstract class Publisher<T> implements PublisherContract {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private payload: T;
  private name: string = 'waba-conv-inner';
  abstract topic: string;

  constructor(payload: T) {
    this.connection = amqp.connect(['amqp://root:root@rabbitmq']);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel) => this.setup(channel),
    });

    this.payload = payload;
  }

  public setup(channel: Channel): any {
    channel.assertExchange(this.name, 'topic', { durable: true });
  }

  public publish() {
    console.info('Publish message', this.constructor.name);
    return this.channel.publish(this.name, this.topic, this.payload);
  }
}

export default Publisher;
