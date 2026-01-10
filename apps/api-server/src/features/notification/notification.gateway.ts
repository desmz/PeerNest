import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { NOTIFICATION_WEB_SOCKET_URL } from '@peernest/core';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';

import { TokenService } from '@/features/auth/token.service';
import { JwtType, TJwtPayload } from '@/features/auth/types/jwt-payload.type';

@WebSocketGateway({
  namespace: NOTIFICATION_WEB_SOCKET_URL,
  cors: { origin: '*', credentials: true },
})
export class NotificationGateway implements OnGatewayConnection, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly tokenService: TokenService) {}

  async handleConnection(client: Socket, ..._args: unknown[]): Promise<void> {
    try {
      this.logger.debug('Establishing websocket connection...');

      const cookies = cookie.parse(client.handshake.headers.cookie ?? '');
      console.log(cookies);

      const authToken = cookies['authToken'];

      if (!authToken) {
        // throw new CustomHttpException('Auth token is missing', HttpErrorCode.RESTRICTED_RESOURCE);
        client.disconnect();
        return;
      }

      const token: TJwtPayload = await this.tokenService.verifyJwt(authToken, JwtType.Access);

      console.log(token);
      const userId = token.sub;

      // this.server
      //   .to('role:admin')
      //   .to('role:moderator')
      //   .emit('notification:new', notification);

      //       client.join([userId, `role:{}`]);
      client.join(userId);

      this.logger.debug(`User ${userId} connected via websocket`);
    } catch (err) {
      this.logger.error('Websocket failed to connect');
      console.error(err);

      client.emit('Unauthorized');
      client.disconnect();
    }
  }

  onModuleDestroy() {
    if (this.server) {
      this.server.close();
      this.logger.debug('Websocket is closed');
    }
  }

  pushToUser(userId: string, notification: unknown) {
    this.server.to(userId).emit('notification:new', notification);
  }
}
