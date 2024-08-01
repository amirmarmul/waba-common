import { logger } from '@/core';
import { Listener as ListenerContract } from '@/core/domain/events/Listener';
import { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';
export { Channel, ChannelWrapper };

export abstract class Listener<T> implements ListenerContract {
  protected static instance: Listener<any>;
  protected connection: AmqpConnectionManager;
  protected channel: ChannelWrapper;
  protected service: string;
  abstract exchange: string;
  abstract topic: string;

  constructor() {
    this.connection = Connection.getConnection();
  }

  init() {
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel): any => this.setup(channel)
    });

    return this;
  }

  protected setup(channel: Channel): void {
    channel.assertExchange(this.exchange, 'topic', { durable: false });
    channel.assertQueue(this.queue);
    channel.bindQueue(this.queue, this.exchange, this.topic);
    channel.prefetch(parseInt(process.env.MQ_PREFETCH! ?? '10'));
  }

  abstract onMessage(data: T, ack: Function, nack?: Function): any;

  public listen() {
    return this.channel.consume(this.queue, (msg) => {
      const parsedMessage = this.parseMessage(msg);
      logger.info('Receive message %s', this.constructor.name, { parsedMessage });
      this.onMessage(parsedMessage, () => this.channel.ack(msg), () => this.channel.nack(msg));
    });
  }

  get queue(): string {
    let queue: string[] = [];
    queue.push(this.service);
    queue.push(this.constructor.name);
    queue.push(this.exchange);
    queue.push(this.topic);
    return queue.join('.');
  }

  protected parseMessage(msg: any) {
    const json = msg.content.toString();
    return JSON.parse(json);
  }
}
