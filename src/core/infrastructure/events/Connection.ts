import amqp, { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';

export { Channel, ChannelWrapper };

export class Connection {
  private static connection: AmqpConnectionManager;

  private constructor() {
    Connection.connection = amqp.connect([process.env.APP_MQ!]);
    Connection.connection.on('error', (err) => {
      console.error('AMQP connection error:', err.message);
    });
  }

  static getConnection(): AmqpConnectionManager {
    if (!Connection.connection) {
      new Connection();
    }
    return Connection.connection;
  }
}
