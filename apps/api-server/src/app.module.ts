import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';

import { ConfigModule } from '@/configs/config.module';
import { UserModule } from '@/features/user/user.module';

export const AppModules = {
  imports: [ConfigModule.register(), UserModule],
  providers: [],
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
