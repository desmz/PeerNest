import { Module } from '@nestjs/common';

import { PronounRepository } from './repos/pronoun.repo';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [],
  controllers: [SystemController],
  providers: [PronounRepository, SystemService],
  exports: [PronounRepository, SystemService],
})
export class SystemModule {}
