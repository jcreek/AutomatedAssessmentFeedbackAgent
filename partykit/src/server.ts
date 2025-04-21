import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Log connection details
    console.log(
      `Connected:\n  id: ${conn.id}\n  room: ${this.room.id}\n  url: ${new URL(ctx.request.url).pathname}`
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    // Broadcast the message to all connected clients in the room
    this.room.broadcast(message);
  }
}

