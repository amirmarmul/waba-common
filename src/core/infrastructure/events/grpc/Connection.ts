import { Server, ServerCredentials } from "@grpc/grpc-js";
import { Field, Root, Type } from "protobufjs";

export class Connection {
  private static connection: Root | null = null;
  private static server: Server | null = null;
  private static exchange: string;

  constructor(exchange: string) {
    Connection.exchange = exchange;
    Connection.connection = new Root();

    const Event = new Type("Event").add(new Field("data", 1, "string"));
    const Listener = new Type("Listener").add(new Field("message", 1, "string"));

    Connection.connection.add(Event).add(Listener);

    if (!Connection.server) {
      Connection.server = new Server();
      Connection.server.bindAsync(exchange, ServerCredentials.createInsecure(), () => {
        Connection.server!.start();
      });
    }
  }

  static async getConnection(): Promise<Root> {
    if (!Connection.connection || !Connection.server) {
      await new Promise<void>((resolve) => {
        const connection = new Connection(Connection.exchange);
        // @ts-ignore
        connection.server!.once('listening', () => {
          resolve();
        });
      });
    }
    return Connection.connection!;
  }
}
