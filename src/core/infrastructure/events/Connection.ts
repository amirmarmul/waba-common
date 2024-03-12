import amqp, { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
export { Channel, ChannelWrapper };

export class Connection {
  protected static instance: Connection;
  public static connection: AmqpConnectionManager;

  constructor() {
    // 
  }

  static getInstance(): Connection {
    if (!this.instance) {
      this.instance = new Connection();
    }

    return this.instance as Connection;
  }

  static init(): AmqpConnectionManager {
    // @ts-ignore
    if (!Connection.getInstance().connection) {
      this.connection = amqp.connect([process.env.APP_MQ!]);
    }

    return this.connection;
  }
}
