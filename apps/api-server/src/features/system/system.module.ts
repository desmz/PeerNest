import { Module } from '@nestjs/common';

import { DomainRepository } from './repos/domain.repo';
import { InterestRepository } from './repos/interest.repo';
import { PersonalGoalRepository } from './repos/personal-goal.repo';
import { PronounRepository } from './repos/pronoun.repo';
import { UniversityRepository } from './repos/university.repo';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [],
  controllers: [SystemController],
  providers: [
    PronounRepository,
    UniversityRepository,
    DomainRepository,
    InterestRepository,
    PersonalGoalRepository,
    SystemService,
  ],
  exports: [
    PronounRepository,
    UniversityRepository,
    DomainRepository,
    InterestRepository,
    PersonalGoalRepository,
    SystemService,
  ],
})
export class SystemModule {}
