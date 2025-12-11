import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { TGetDomainsVo, TGetPronounsVo, TGetUniversityVo } from '@peernest/contract';

import { SystemService } from './system.service';

@Controller('api/sys')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('pronouns')
  @HttpCode(HttpStatus.OK)
  async getPronouns(): Promise<TGetPronounsVo> {
    return this.systemService.getPronouns();
  }

  @Get('universities')
  @HttpCode(HttpStatus.OK)
  async getUniversities(): Promise<TGetUniversityVo> {
    return this.systemService.getUniversities();
  }

  @Get('domains')
  @HttpCode(HttpStatus.OK)
  async getDomains(): Promise<TGetDomainsVo> {
    return this.systemService.getDomains();
  }
}
