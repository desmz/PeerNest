import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { KyselyModule } from '@peernest/db';
import { ClsModule } from 'nestjs-cls';

import { ConfigModule } from '@/configs/config.module';
import { AttachmentModule } from '@/features/attachment/attachment.module';
import { AuthModule } from '@/features/auth/auth.module';
import { JwtAuthGuard } from '@/features/auth/guards/jwt.guard';
import { RolesGuard } from '@/features/auth/guards/roles.guard';
import { CommentModule } from '@/features/comment/comment.module';
import { DiscussionModule } from '@/features/discussion/discussion.module';
import { FriendshipModule } from '@/features/friendship/friendship.module';
import { MailSenderModule } from '@/features/mail-sender/mail-sender.module';
import { ModerationModule } from '@/features/moderation/moderation.module';
import { SystemModule } from '@/features/system/system.module';
import { UserModule } from '@/features/user/user.module';
import { WellnessModule } from '@/features/wellness/wellness.module';
import { PersistenceModule } from '@/persistence/persistence.module';

export const AppModules = {
  imports: [
    ConfigModule.register(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    KyselyModule.forRoot({ formatted: true }),
    PersistenceModule,
    MailSenderModule.register({ global: true }),
    SystemModule,
    UserModule,
    AuthModule,
    AttachmentModule,
    FriendshipModule,
    DiscussionModule,
    CommentModule,
    WellnessModule,
    ModerationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [],
};

@Global()
@Module(AppModules)
export class AppModule {
  static register(moduleMetadata: ModuleMetadata): DynamicModule {
    return {
      module: AppModule,
      global: true,
      imports: [...AppModules.imports, ...(moduleMetadata.imports || [])],
      providers: [...AppModules.providers, ...(moduleMetadata.providers || [])],
      exports: [...AppModules.exports, ...(moduleMetadata.exports || [])],
    };
  }
}
