import { Listener as BaseListener, Channel } from '@/core/infrastructure/events/Listener';

export abstract class Listener<T> extends BaseListener<T> {
  public setup(channel: Channel) {
    channel.assertQueue(this.queue, { durable: true });
  }

  public listen() {
    return this.channel.consume(this.queue, async (msg) => {
      const parsedMessage = this.parseMessage(msg);
      const res = await this.onMessage(parsedMessage, () => this.channel.ack);
      this.channel.sendToQueue(msg.properties.replyTo, res, {
        // @ts-ignore
        correlationId: msg.properties.correlationId
      });
      this.channel.ack(msg);
    });
  }

  get queue() {
    const queue: string[] = [];
    queue.push('Rmq');
    queue.push('rpc');
    queue.push(this.exchange);
    queue.push(this.topic);
    return queue.join('.');
  }
}
