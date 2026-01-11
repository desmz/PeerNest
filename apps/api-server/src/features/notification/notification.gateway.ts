import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {
  NOTIFICATION_WEB_SOCKET_NAMESPACE,
  TNotificationObj,
  TNotificationType,
  TSocketRecipients,
  TSocketRoleRoom,
  UserRole,
  WEB_SOCKET_EVENTS,
} from '@peernest/core';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';

import { TokenService } from '@/features/auth/token.service';
import { JwtType, TJwtPayload } from '@/features/auth/types/jwt-payload.type';
import { UserRepository } from '@/persistence/repos/user';

@WebSocketGateway({
  namespace: NOTIFICATION_WEB_SOCKET_NAMESPACE,
  cors: { origin: '*', credentials: true },
})
export class NotificationGateway implements OnGatewayConnection, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository
  ) {}

  async handleConnection(client: Socket, ..._args: unknown[]): Promise<void> {
    try {
      this.logger.debug('Establishing websocket connection...');

      const cookies = cookie.parse(client.handshake.headers.cookie ?? '');

      const authToken = cookies['authToken'];

      if (!authToken) {
        client.disconnect();
        this.logger.error('Auth token is missing');
        return;
      }

      const token: TJwtPayload = await this.tokenService.verifyJwt(authToken, JwtType.Access);

      const userId = token.sub;

      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        client.disconnect();
        this.logger.error(`User ${userId} is missing`);
        return;
      }

      client.join(userId);

      if (user.roleName === UserRole.Admin || user.roleName === UserRole.Moderator) {
        const room: TSocketRoleRoom = `role:${user.roleName}`;
        client.join(room);
      }

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

  pushToUser<T extends TNotificationType>(
    recipients: TSocketRecipients,
    notificationPayload: TNotificationObj<T>
  ) {
    const { roles, userIds } = recipients;

    let roleRooms: TSocketRoleRoom[] = [];

    if (roles && roles.length > 0) {
      roleRooms = roles.map((roleName) => `role${roleName}` as TSocketRoleRoom) || [];
    }

    const rooms: string[] = [];

    if (userIds) {
      rooms.push(...userIds);
    }

    if (roleRooms) {
      rooms.push(...roleRooms);
    }

    this.server.to(rooms).emit(WEB_SOCKET_EVENTS.NEW_NOTIFICATION, notificationPayload);
  }
}
