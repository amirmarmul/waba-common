import { logger, Listener as BaseListener, Channel } from '@/core';

export abstract class Listener<T> extends BaseListener<T> {
  public setup(channel: Channel) {
    channel.assertQueue(this.queue, { durable: true });
    channel.prefetch(1);
  }

  public listen() {
    return this.channel.consume(this.queue, async (msg) => {
      const parsedMessage = this.parseMessage(msg);
      logger.info('Receive message %s', this.constructor.name, { parsedMessage });
      const res = await this.onMessage(parsedMessage, () => this.channel.ack);
      await this.channel.sendToQueue(msg.properties.replyTo, res, {
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
