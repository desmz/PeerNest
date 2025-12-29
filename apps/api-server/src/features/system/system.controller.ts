import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  createInterestRoSchema,
  type TCreateInterestRo,
  type TCreateInterestVo,
  type TGetDomainsVo,
  type TGetInterestsVo,
  type TGetPersonalGoalsVo,
  type TGetPronounsVo,
  type TGetUniversityVo,
  type TGetWellnessFactorsVo,
  type TGetWellnessMoodsVo,
  type TGetWellnessSymptomsVo,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { Roles } from '../auth/decorators/roles.decorator';

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

  @Get('interests')
  @HttpCode(HttpStatus.OK)
  async getInterests(): Promise<TGetInterestsVo> {
    return this.systemService.getInterests();
  }

  @Get('personal-goals')
  @HttpCode(HttpStatus.OK)
  async getPersonalGoals(): Promise<TGetPersonalGoalsVo> {
    return this.systemService.getPersonalGoals();
  }

  @Get('wellness-moods')
  @HttpCode(HttpStatus.OK)
  async getWellnessMoods(): Promise<TGetWellnessMoodsVo> {
    return this.systemService.getWellnessMoods();
  }

  @Get('wellness-symptoms')
  @HttpCode(HttpStatus.OK)
  async getWellnessSymptoms(): Promise<TGetWellnessSymptomsVo> {
    return this.systemService.getWellnessSymptoms();
  }

  @Get('wellness-factors')
  @HttpCode(HttpStatus.OK)
  async getWellnessFactors(): Promise<TGetWellnessFactorsVo> {
    return this.systemService.getWellnessFactors();
  }

  @Roles(UserRole.Admin)
  @Post('interests')
  @HttpCode(HttpStatus.CREATED)
  async createInterest(
    @Body(new ZodValidationPipe(createInterestRoSchema)) createInterestRo: TCreateInterestRo
  ): Promise<TCreateInterestVo> {
    return this.systemService.createInterest(createInterestRo);
  }
}
