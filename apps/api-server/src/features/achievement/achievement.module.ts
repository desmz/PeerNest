import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { AchievementHandlersRegistry } from './achievement-handlers-registry';
import { AchievementService } from './achievement.service';
import { AchievementHandlers } from './achievement.token';
import AchievementHandler from './handlers/achievement-handler';
import { CreateAccountHandler } from './handlers/create-account.handler';

const achievementHandlers = [CreateAccountHandler];

@Module({
  imports: [PersistenceModule],
  controllers: [],
  providers: [
    ...achievementHandlers,
    {
      provide: AchievementHandlers,
      inject: achievementHandlers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...handlers: AchievementHandler<any>[]) => handlers,
    },
    AchievementHandlersRegistry,
    AchievementService,
  ],
  exports: [AchievementService],
})
export class AchievementModule {}
