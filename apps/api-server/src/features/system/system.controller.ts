import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { TGetPronounsVo } from '@peernest/contract';

import { SystemService } from './system.service';

@Controller('api/sys')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('pronouns')
  @HttpCode(HttpStatus.OK)
  async getPronouns(): Promise<TGetPronounsVo> {
    return this.systemService.getPronouns();
  }
}
