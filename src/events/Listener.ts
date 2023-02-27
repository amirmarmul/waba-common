import { Listener as ListenerContract } from '../contracts/Listener';
import amqp, { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

abstract class Listener<T> implements ListenerContract {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  abstract name: string;
  abstract topic: string;

  constructor() {
    this.connection = amqp.connect(['amqp://root:root@rabbitmq']);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel) => this.setup(channel),
    });
  }

  abstract onMessage(data: T, ack: Function): void;
  abstract setup(channel: Channel): any;

  public listen(): void {
    this.channel.consume(this.queue, (msg) => {
      const parsedMessage = this.parseMessage(msg);
      console.info('Receive message', this.constructor.name, parsedMessage);
      this.onMessage(parsedMessage, () => this.channel.ack(msg));
    }, { noAck: false });
  }

  public get queue() {
    let queue = this.name;

    if (this.topic) {
      queue += `.${this.topic}`;
    }

    return queue;
  }

  private parseMessage(msg: any) {
    const json = msg.content.toString();
    return JSON.parse(json);
  }
}

export default Listener;
