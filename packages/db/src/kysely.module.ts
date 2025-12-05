import { DynamicModule, Global, Module } from '@nestjs/common';

import { KyselyService, TKyselyServiceOptions } from './kysely.service';

@Global()
@Module({
  providers: [KyselyService],
  exports: [KyselyService],
})
export class KyselyModule {
  static forRoot(options: Partial<TKyselyServiceOptions> = {}): DynamicModule {
    return {
      module: KyselyModule,
      providers: [
        {
          provide: KyselyService,
          useFactory: () => new KyselyService(options),
        },
      ],
      exports: [KyselyService],
    };
  }
}
