import * as protoLoader from '@grpc/proto-loader';
import { Method, Root, Service } from 'protobufjs';
import { Connection } from './Connection';
import { Server, loadPackageDefinition } from '@grpc/grpc-js';
import logger from '@/core/utils/logger';

export abstract class Listener<T> {
  protected connection: Root;
  protected server: Server;
  protected channel: any;
  protected payload: T;
  abstract exchange: string;

  constructor() {
    this.connection = Connection.getConnection();
    this.server = Connection.getServer();
    this.setup();
  }

  init() {
    const packageDefinition = protoLoader.fromJSON(this.connection.toJSON())
    this.channel = loadPackageDefinition(packageDefinition);

    return this;
  }

  protected async setup() {
    if (!this.connection.get(this.constructorName)) {
      const service = new Service(this.constructorName).add(new Method("Publish", "rpc", 'Event', 'Listener'));
      this.connection.add(service);
    }
  }

  abstract onMessage(data: T): Promise<any>;

  public async listen() {
    this.server.addService(this.channel[this.constructorName].service, {
      publish: async (call: any, callback: Function) => {
        const parsedMessage = this.parseMessage(call.request.data);
        logger.info('Receive message %s', this.constructor.name, { parsedMessage });
        const res = await this.onMessage(parsedMessage);
        callback(null, { message: JSON.stringify(res) });
      }
    });
  }

  get constructorName() {
    return this.constructor.name.replace(/Listener/g, '')
  }

  protected parseMessage(message: any) {
    const json = message.toString();
    return JSON.parse(json);
  }
}
