import { Module } from '@nestjs/common';

import { TokenModule } from '@/features/auth/token.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationDispatcher } from './services/notification-dispatcher';
import { NotificationListener } from './services/notification-listener';
import { NotificationTemplate } from './services/notification-template';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [PersistenceModule, TokenModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationTemplate,
    NotificationListener,
    NotificationDispatcher,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
