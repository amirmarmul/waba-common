import { ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';

export class ChannelEvent {
  private static channel?: ChannelWrapper;

  private constructor() {
    ChannelEvent.channel = Connection.getConnection().createChannel({
      json: true,
    });

    ChannelEvent.channel.on('error', () => {
      ChannelEvent.channel = undefined;
    });

    ChannelEvent.channel.on('close', () => {
      ChannelEvent.channel = undefined;
    });
  }

  static getChannel(): ChannelWrapper{
    if (!ChannelEvent.channel) {
      new ChannelEvent();
    }
    return ChannelEvent.channel as ChannelWrapper;
  }
}
