import amqp, { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
import logger from '@/core/utils/logger';

type ConnectionType = 'publisher' | 'listener' | 'default';

export { Channel, ChannelWrapper };

export class Connection {
  private static connections: Record<ConnectionType, AmqpConnectionManager | null> = {
    default: null,
    listener: null,
    publisher: null
  };

  private constructor() {
    //
  }

  private static createConnection(connectionType: ConnectionType = 'default'): AmqpConnectionManager {
    const connection = amqp.connect([process.env.APP_MQ!]);

    connection.on('connect', () => {
      logger.info('Connection established successfully.', { connectionType });
    });

    connection.on('disconnect', (params) => {
      logger.warn('Connection lost. ', { connectionType, reason: params.err.message });
      this.connections[connectionType] = null;
    });

    this.connections[connectionType] = connection;
    return connection;
  }

  static getConnection(connectionType: ConnectionType = 'default'): AmqpConnectionManager {
    return this.connections[connectionType] ?? this.createConnection(connectionType);
  }
}
