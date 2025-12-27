import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  createWellnessCheckInRoSchema,
  getMyWellnessCheckInsQueryParamsSchema,
  type TGetMyWellnessCheckInsQueryParams,
  type TGetMyWellnessCheckInsVo,
  type TCreateWellnessCheckInRo,
  type TCreateWellnessCheckInVo,
  getWellnessCheckInParamsSchema,
  type TGetMyWellnessCheckInParams,
  type TGetWellnessCheckInVo,
  type TGetWellnessMoodsSummaryQueryParams,
  type TGetWellnessMoodsSummaryVo,
  getWellnessMoodsSummaryQueryParamsSchema,
  getWellnessSymptomsSummaryQueryParamsSchema,
  type TGetWellnessSymptomsSummaryQueryParams,
  type TGetWellnessSymptomsSummaryVo,
  getWellnessFactorsSummaryQueryParamsSchema,
  type TGetWellnessFactorsSummaryQueryParams,
  type TGetWellnessFactorsSummaryVo,
  type TGetWellnessCalendarQueryParams,
  type TGetWellnessCalendarVoSchema,
  getWellnessCalendarQueryParamsSchema,
  getWellnessTrendsQueryParamsSchema,
  type TGetWellnessTrendsVo,
  type TGetWellnessTrendsQueryParams,
} from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { WellnessService } from './wellness.service';

@Controller('api/wellness')
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  @Post('check-ins')
  @HttpCode(HttpStatus.CREATED)
  async createWellnessCheckIn(
    @Body(new ZodValidationPipe(createWellnessCheckInRoSchema))
    createWellnessCheckInRo: TCreateWellnessCheckInRo
  ): Promise<TCreateWellnessCheckInVo> {
    return this.wellnessService.createWellnessCheckIn(createWellnessCheckInRo);
  }

  @Get('check-ins/me')
  @HttpCode(HttpStatus.OK)
  async getMyWellnessCheckIns(
    @Query(new ZodValidationPipe(getMyWellnessCheckInsQueryParamsSchema))
    getMyWellnessCheckInsQueryParams: TGetMyWellnessCheckInsQueryParams
  ): Promise<TGetMyWellnessCheckInsVo> {
    return this.wellnessService.getMyWellnessCheckIns(getMyWellnessCheckInsQueryParams);
  }

  @Get('check-ins/:checkInId')
  @HttpCode(HttpStatus.OK)
  async getWellnessCheckIn(
    @Param(new ZodValidationPipe(getWellnessCheckInParamsSchema))
    getWellnessCheckInParams: TGetMyWellnessCheckInParams
  ): Promise<TGetWellnessCheckInVo> {
    return this.wellnessService.getWellnessCheckIn(getWellnessCheckInParams);
  }

  @Get('stats/moods')
  @HttpCode(HttpStatus.OK)
  async getWellnessMoodsSummary(
    @Query(new ZodValidationPipe(getWellnessMoodsSummaryQueryParamsSchema))
    getWellnessMoodsSummaryQueryParams: TGetWellnessMoodsSummaryQueryParams
  ): Promise<TGetWellnessMoodsSummaryVo> {
    return this.wellnessService.getWellnessMoodsSummary(getWellnessMoodsSummaryQueryParams);
  }

  @Get('stats/symptoms')
  @HttpCode(HttpStatus.OK)
  async getWellnessSymptomsSummary(
    @Query(new ZodValidationPipe(getWellnessSymptomsSummaryQueryParamsSchema))
    getWellnessSymptomsSummaryQueryParams: TGetWellnessSymptomsSummaryQueryParams
  ): Promise<TGetWellnessSymptomsSummaryVo> {
    return this.wellnessService.getWellnessSymptomsSummary(getWellnessSymptomsSummaryQueryParams);
  }

  @Get('stats/factors')
  @HttpCode(HttpStatus.OK)
  async getWellnessFactorsSummary(
    @Query(new ZodValidationPipe(getWellnessFactorsSummaryQueryParamsSchema))
    getWellnessFactorsSummaryQueryParams: TGetWellnessFactorsSummaryQueryParams
  ): Promise<TGetWellnessFactorsSummaryVo> {
    return this.wellnessService.getWellnessFactorsSummary(getWellnessFactorsSummaryQueryParams);
  }

  @Get('stats/calendar')
  @HttpCode(HttpStatus.OK)
  async getWellnessCalendar(
    @Query(new ZodValidationPipe(getWellnessCalendarQueryParamsSchema))
    getWellnessCalendarQueryParams: TGetWellnessCalendarQueryParams
  ): Promise<TGetWellnessCalendarVoSchema> {
    return this.wellnessService.getWellnessCalendar(getWellnessCalendarQueryParams);
  }

  @Get('stats/trends')
  @HttpCode(HttpStatus.OK)
  async getWellnessTrends(
    @Query(new ZodValidationPipe(getWellnessTrendsQueryParamsSchema))
    getWellnessTrendsQueryParams: TGetWellnessTrendsQueryParams
  ): Promise<TGetWellnessTrendsVo> {
    return this.wellnessService.getWellnessTrends(getWellnessTrendsQueryParams);
  }
}
