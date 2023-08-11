import { UniqueId } from '@/core/domain/UniqueId';
import { Event as BaseEvent, Channel } from '@/core/infrastructure/events/Event';

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
    return new Promise((resolve) => {
      const correlationId = this.correlationId;
      this.channel.consume(this.exclusiveQueue, (msg) => {
        if (msg.properties.correlationId == correlationId) {
          const parsedMessage = this.parseMessage(msg);
          resolve(parsedMessage as Response);
          this.connection.close();
        }
      }, {
        // @ts-ignore
        noAck: true
      });

      this.channel.sendToQueue(this.queue, this.payload, {
        // @ts-ignore
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
