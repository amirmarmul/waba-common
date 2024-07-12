import { ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';

export class ChannelEvent {
  private static channel: ChannelWrapper;

  private constructor() {
    ChannelEvent.channel = Connection.getConnection().createChannel({
      json: true,
    });
  }

  static getChannel(): ChannelWrapper {
    if (!ChannelEvent.channel) {
      new ChannelEvent();
    }
    return ChannelEvent.channel;
  }
}
