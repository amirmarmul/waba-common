import { ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';
import logger from '@/core/utils/logger';

export class ChannelEvent {
  private static channel?: ChannelWrapper;

  private constructor() {
    ChannelEvent.channel = Connection.getConnection().createChannel({
      json: true,
    });

    ChannelEvent.channel.on('error', (err) => {
      logger.error('AMQP channel error:', { msg: err.message, stack: err.stack });
      ChannelEvent.channel = undefined;
    });

    ChannelEvent.channel.on('close', () => {
      logger.error('AMQP channel error:', { msg: 'closed' });
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
