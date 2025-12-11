import { Module } from '@nestjs/common';

import { PronounRepository } from './repos/pronoun.repo';
import { UniversityRepository } from './repos/university.repo';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [],
  controllers: [SystemController],
  providers: [PronounRepository, UniversityRepository, SystemService],
  exports: [PronounRepository, UniversityRepository, SystemService],
})
export class SystemModule {}
