
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Method, Root, Service } from "protobufjs";
import { Connection } from "./Connection";
import logger from '@/core/utils/logger';

export abstract class Event<T> {
  protected connection: Root;
  protected channel: any;
  protected payload: T;
  abstract exchange: string;

  constructor(payload: T) {
    this.connection = Connection.getConnection();
    this.payload = payload;
    this.setup();
  }

  init() {
    const packageDefinition = protoLoader.fromJSON(this.connection.toJSON());
    const channel: any = grpc.loadPackageDefinition(packageDefinition);
    this.channel = new channel[this.constructor.name](this.exchange, grpc.credentials.createInsecure());

    return this;
  }

  protected setup() {
    try {
      if (!this.connection.get(this.constructor.name)) {
        const service = new Service(this.constructor.name).add(new Method("Publish", "rpc", 'Event', 'Listener'));
        this.connection.add(service);
      }
    } catch (error: any) {
      logger.error('Error while connecting the server', { error: error.stack });
    }
  }

  publish<Response>(options = {}): Promise<Response> {
    logger.debug('Publish message %s', this.constructor.name);
    return new Promise((resolve, reject) => {
      const handleMessage = (err: any, response: any) => {
        if (err) {
          console.log({ err })
          reject(err);
        }

        const message = this.parseMessage(response?.message);
        resolve(message);
      }

      this.channel.publish({ data: JSON.stringify(this.payload) }, handleMessage);
    });
  }

  protected parseMessage(message: any) {
    const json = message.toString();
    return JSON.parse(json);
  }
}
