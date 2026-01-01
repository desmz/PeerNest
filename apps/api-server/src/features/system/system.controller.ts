import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import {
  createInterestRoSchema,
  type TUpdateInterestRo,
  type TUpdateInterestVo,
  updateInterestRoSchema,
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
  type TUpdateInterestParams,
  createPersonalGoalRoSchema,
  type TCreatePersonalGoalRo,
  type TCreatePersonalGoalVo,
  type TUpdatePersonalGoalParams,
  updatePersonalGoalRoSchema,
  type TUpdatePersonalGoalRo,
  type TUpdatePersonalGoalVo,
  createWellnessMoodRoSchema,
  type TCreateWellnessMoodRo,
  type TCreateWellnessMoodVo,
  type TUpdateWellnessMoodParams,
  updateWellnessMoodRoSchema,
  type TUpdateWellnessMoodRo,
  type TUpdateWellnessMoodVo,
  createWellnessSymptomRoSchema,
  type TCreateWellnessSymptomRo,
  type TCreateWellnessSymptomVo,
  type TUpdateWellnessSymptomParams,
  updateWellnessSymptomRoSchema,
  type TUpdateWellnessSymptomRo,
  type TUpdateWellnessSymptomVo,
  createWellnessFactorRoSchema,
  type TCreateWellnessFactorRo,
  type TCreateWellnessFactorVo,
  type TUpdateWellnessFactorParams,
  updateWellnessFactorRoSchema,
  type TUpdateWellnessFactorRo,
  type TUpdateWellnessFactorVo,
  TGetRolesVo,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { Roles } from '../auth/decorators/roles.decorator';

import { SystemService } from './system.service';

@Controller('api/sys')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('roles')
  @HttpCode(HttpStatus.OK)
  async getRoles(): Promise<TGetRolesVo> {
    return this.systemService.getRoles();
  }

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

  @Roles(UserRole.Admin)
  @Put('interests/:interestId')
  @HttpCode(HttpStatus.OK)
  async updateInterest(
    @Param() updateInterestParams: TUpdateInterestParams,
    @Body(new ZodValidationPipe(updateInterestRoSchema)) updateInterestRo: TUpdateInterestRo
  ): Promise<TUpdateInterestVo> {
    return this.systemService.updateInterest(updateInterestParams, updateInterestRo);
  }

  @Roles(UserRole.Admin)
  @Post('personal-goals')
  @HttpCode(HttpStatus.CREATED)
  async createPersonalGoal(
    @Body(new ZodValidationPipe(createPersonalGoalRoSchema))
    createPersonalGoalRo: TCreatePersonalGoalRo
  ): Promise<TCreatePersonalGoalVo> {
    return this.systemService.createPersonalGoal(createPersonalGoalRo);
  }

  @Roles(UserRole.Admin)
  @Put('personal-goals/:personalGoalId')
  @HttpCode(HttpStatus.OK)
  async updatePersonalGoal(
    @Param() updatePersonalGoalParams: TUpdatePersonalGoalParams,
    @Body(new ZodValidationPipe(updatePersonalGoalRoSchema))
    updatePersonalGoalRo: TUpdatePersonalGoalRo
  ): Promise<TUpdatePersonalGoalVo> {
    return this.systemService.updatePersonalGoal(updatePersonalGoalParams, updatePersonalGoalRo);
  }

  @Roles(UserRole.Admin)
  @Post('wellness-moods')
  @HttpCode(HttpStatus.CREATED)
  async createWellnessMood(
    @Body(new ZodValidationPipe(createWellnessMoodRoSchema))
    createWellnessMoodRo: TCreateWellnessMoodRo
  ): Promise<TCreateWellnessMoodVo> {
    return this.systemService.createWellnessMood(createWellnessMoodRo);
  }

  @Roles(UserRole.Admin)
  @Put('wellness-moods/:wellnessMoodId')
  @HttpCode(HttpStatus.OK)
  async updateWellnessMood(
    @Param() updateWellnessMoodParams: TUpdateWellnessMoodParams,
    @Body(new ZodValidationPipe(updateWellnessMoodRoSchema))
    updateWellnessMoodRo: TUpdateWellnessMoodRo
  ): Promise<TUpdateWellnessMoodVo> {
    return this.systemService.updateWellnessMood(updateWellnessMoodParams, updateWellnessMoodRo);
  }

  @Roles(UserRole.Admin)
  @Post('wellness-symptoms')
  @HttpCode(HttpStatus.CREATED)
  async createWellnessSymptom(
    @Body(new ZodValidationPipe(createWellnessSymptomRoSchema))
    createWellnessSymptomRo: TCreateWellnessSymptomRo
  ): Promise<TCreateWellnessSymptomVo> {
    return this.systemService.createWellnessSymptom(createWellnessSymptomRo);
  }

  @Roles(UserRole.Admin)
  @Put('wellness-symptoms/:wellnessSymptomId')
  @HttpCode(HttpStatus.OK)
  async updateWellnessSymptom(
    @Param() updateWellnessSymptomParams: TUpdateWellnessSymptomParams,
    @Body(new ZodValidationPipe(updateWellnessSymptomRoSchema))
    updateWellnessSymptomRo: TUpdateWellnessSymptomRo
  ): Promise<TUpdateWellnessSymptomVo> {
    return this.systemService.updateWellnessSymptom(
      updateWellnessSymptomParams,
      updateWellnessSymptomRo
    );
  }

  @Roles(UserRole.Admin)
  @Post('wellness-factors')
  @HttpCode(HttpStatus.CREATED)
  async createWellnessFactor(
    @Body(new ZodValidationPipe(createWellnessFactorRoSchema))
    createWellnessFactorRo: TCreateWellnessFactorRo
  ): Promise<TCreateWellnessFactorVo> {
    return this.systemService.createWellnessFactor(createWellnessFactorRo);
  }

  @Roles(UserRole.Admin)
  @Put('wellness-factors/:wellnessFactorId')
  @HttpCode(HttpStatus.OK)
  async updateWellnessFactor(
    @Param() updateWellnessFactorParams: TUpdateWellnessFactorParams,
    @Body(new ZodValidationPipe(updateWellnessFactorRoSchema))
    updateWellnessFactorRo: TUpdateWellnessFactorRo
  ): Promise<TUpdateWellnessFactorVo> {
    return this.systemService.updateWellnessFactor(
      updateWellnessFactorParams,
      updateWellnessFactorRo
    );
  }
}
