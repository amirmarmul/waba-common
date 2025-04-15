import { logger } from '@/core';
import { Listener as ListenerContract } from '@/core/domain/events/Listener';
import { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';
export { Channel, ChannelWrapper, Connection };

export abstract class Listener<T> implements ListenerContract {
  protected static instance: Listener<any>;
  protected connection: AmqpConnectionManager;
  protected channel: ChannelWrapper;
  protected service: string;
  protected extraQueues: any = {};
  abstract exchange: string;
  abstract topic: string;
  protected exclusiveConnection: boolean = false;

  constructor() {
    this.connection = Connection.getConnection(this.connectionName);
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

  protected setupExtraQueue(channel: Channel, suffixes: string[] = ['backup']) {
    suffixes.forEach((suffix) => {
      this.extraQueues[suffix] = `${this.queue}.${suffix}`;
      const extraTopic = `${this.topic}.${suffix}`;
      channel.assertQueue(this.extraQueues[suffix], { durable: false });
      channel.bindQueue(this.extraQueues[suffix], this.exchange, extraTopic);
    });
  }

  abstract onMessage(data: T, ack: Function, nack?: Function): any;

  public listen() {
    return this.channel.consume(this.queue, (msg) => {
      const parsedMessage = this.parseMessage(msg);
      logger.debug('Receive message %s', this.constructor.name, { parsedMessage });
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

  get connectionName(): string {
    return this.exclusiveConnection ? this.constructor.name : 'listener';
  }

  protected parseMessage(msg: any) {
    const json = msg.content.toString();
    return JSON.parse(json);
  }
}
