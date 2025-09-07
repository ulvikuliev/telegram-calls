import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class CallsGateway {
  @WebSocketServer()
  private readonly server!: Server;

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ): Promise<void> {
    const { roomId } = payload;
    await client.join(roomId);
    const size = this.server.sockets.adapter.rooms.get(roomId)?.size ?? 0;
    if (size === 2) {
      client.emit('be-initiator', { roomId });
      client.to(roomId).emit('peer-join', { id: client.id });
    }
  }
}
