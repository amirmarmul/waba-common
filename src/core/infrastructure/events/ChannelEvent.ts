import { ChannelWrapper } from 'amqp-connection-manager';
import { Connection } from './Connection';
import logger from '@/core/utils/logger';

type ChannelType = 'publisher' | 'default';

export class ChannelEvent {
  private static channels: Record<ChannelType, ChannelWrapper | null> = {
    default: null,
    publisher: null
  };

  private constructor() {
    //
  }

  private static createChannel(channelType: ChannelType = 'default') {
    const connection =
      channelType === 'default'
      ? Connection.getConnection('default')
      : Connection.getConnection('publisher');

      const channel = connection.createChannel({ json: true });

      channel.on('error', (err) => {
        logger.error('AMQP channel error:', { msg: err.message, stack: err.stack });
        this.channels[channelType] = null;
      });

      channel.on('close', () => {
        logger.error('AMQP channel error:', { msg: 'closed' });
        this.channels[channelType] = null;
      });

      this.channels[channelType] = channel;
      return channel;
  }

  static getChannel(channelType: ChannelType = 'default'): ChannelWrapper {
    return this.channels[channelType] ?? this.createChannel(channelType);
  }
}
