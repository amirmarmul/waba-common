import { logger, UniqueId, Event as BaseEvent, Channel } from '@/core';

export abstract class Event<T> extends BaseEvent<T> {
  readonly correlationId: string;

  constructor(payload: T) {
    super(payload);
    this.correlationId = this.uniqueId();
  }

  public setup(channel: Channel): void {
    channel.assertQueue(this.exclusiveQueue, { exclusive: true });
  }

  public publish<Response>(): Promise<Response> {
    logger.info('Publish message %s', this.constructor.name);
    return new Promise(resolve => {
      const correlationId = this.correlationId;
      const handleMessage = async (msg: any) => {
        if (msg.properties.correlationId == correlationId) {
          const parsedMessage = this.parseMessage(msg);

          this.channel.removeListener('message', handleMessage);
          await this.close()

          resolve(parsedMessage as Response);
        }
      }

      this.channel.consume(this.exclusiveQueue, handleMessage, { noAck: true });

      this.channel.sendToQueue(this.queue, this.payload, {
        correlationId: correlationId,
        replyTo: this.exclusiveQueue,
      });
    });
  }

  get queue(): string {
    const queue: string[] = [];
    queue.push('Rmq');
    queue.push('rpc');
    queue.push(this.exchange);
    queue.push(this.topic);
    return queue.join('.');
  }

  get exclusiveQueue(): string {
    const executiveQueue: string[] = [];
    executiveQueue.push(this.constructor.name);
    executiveQueue.push(this.exchange);
    executiveQueue.push(this.topic);
    executiveQueue.push(this.correlationId);
    return executiveQueue.join('.');
  }

  protected uniqueId(): string {
    return String(new UniqueId);
  }

  protected parseMessage(msg: any) {
    const json = msg.content.toString();
    return JSON.parse(json);
  }
}
