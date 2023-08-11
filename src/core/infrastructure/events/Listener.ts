import { Listener as ListenerContract } from '@/core/domain/events/Listener';
import amqp, { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
export { Channel, ChannelWrapper };

export abstract class Listener<T> implements ListenerContract {
  protected connection: AmqpConnectionManager;
  protected channel: ChannelWrapper;
  abstract topic: string;
  abstract exchange: string;

  constructor() {
    this.connection = amqp.connect([ process.env.APP_MQ! ]);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel): any => this.setup(channel)
    });
  }

  abstract setup(channel: Channel): any;
  abstract onMessage(data: T, ack: Function): any;

  public listen() {
    return this.channel.consume(this.queue, (msg) => {
      const parsedMessage = this.parseMessage(msg);
      console.info('Receive message %s', this.constructor.name);
      this.onMessage(parsedMessage, () => this.channel.ack(msg));
    });
  }

  get queue(): string {
    let queue: string[] = [];
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
