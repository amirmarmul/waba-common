import { logger } from '@/core';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Method, Root, Service } from 'protobufjs';
import { Connection } from './Connection';

export abstract class Listener<T> {
  protected connection: Root;
  protected channel: any;
  protected payload: T;
  protected exchange: string;

  constructor() {
    this.connection = Connection.getConnection(this.exchange);
    this.setup();
  }

  init() {
    const packageDefinition = protoLoader.fromJSON(this.connection.toJSON())
    this.channel = grpc.loadPackageDefinition(packageDefinition);

    return this;
  }

  protected async setup() {
    const service = new Service(this.constructorName).add(new Method("Publish", "rpc", 'Event', 'Listener'));
    this.connection.add(service);
  }

  abstract onMessage(data: T): Promise<any>;

  public async listen() {
    const server = new grpc.Server();
    server.addService(this.channel[this.constructorName].service, {
      publish: async (call: any, callback: Function) => {
        const parsedMessage = this.parseMessage(call.request.data);
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
