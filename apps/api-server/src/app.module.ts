import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { KyselyModule } from '@peernest/db';

import { ConfigModule } from '@/configs/config.module';
import { AttachmentModule } from '@/features/attachment/attachment.module';
import { AuthModule } from '@/features/auth/auth.module';
import { JwtAuthGuard } from '@/features/auth/guards/jwt.guard';
import { UserModule } from '@/features/user/user.module';

export const AppModules = {
  imports: [
    ConfigModule.register(),
    KyselyModule.forRoot({ formatted: true }),
    UserModule,
    AuthModule,
    AttachmentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
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
