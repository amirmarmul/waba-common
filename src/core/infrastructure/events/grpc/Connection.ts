import { Server, ServerCredentials } from "@grpc/grpc-js";
import { Field, Root, Type } from "protobufjs";

export class Connection {
  private static connection: Root | null = null;
  private static server: Server | null = null;

  constructor() {
    Connection.connection = new Root();

    const Event = new Type("Event").add(new Field("data", 1, "string"));
    const Listener = new Type("Listener").add(new Field("message", 1, "string"));

    Connection.connection.add(Event).add(Listener);
  }

  static getConnection(): Root {
    if (!Connection.connection || !Connection.server) {
      new Connection();
    }
    return Connection.connection!;
  }
}
