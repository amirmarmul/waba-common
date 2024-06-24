import amqp, { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';

export { Channel, ChannelWrapper };

export class Connection {
  private static connection: AmqpConnectionManager;
  private static isConnected: boolean;

  private constructor() {
    Connection.connection = amqp.connect([process.env.APP_MQ!]);
    Connection.isConnected = false;
    Connection.connection.on('connect', () => {
      Connection.isConnected = true;
    });
    Connection.connection.on('error', (err) => {
      console.error('AMQP connection error:', err.message);
      Connection.isConnected = false;
    });
  }

  static getConnection(): AmqpConnectionManager {
    if (!Connection.connection) {
      new Connection();
    }
    return Connection.connection;
  }

  static readyState(): boolean {
    return Connection.isConnected;
  }
}
