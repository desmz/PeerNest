import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import {
  createWellnessCheckInRoSchema,
  getMyWellnessCheckInsQueryParamsSchema,
  type TGetMyWellnessCheckInsQueryParams,
  type TGetMyWellnessCheckInsVo,
  type TCreateWellnessCheckInRo,
  type TCreateWellnessCheckInVo,
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

  @Get('/check-ins/me')
  @HttpCode(HttpStatus.OK)
  async getMyWellnessCheckIns(
    @Query(new ZodValidationPipe(getMyWellnessCheckInsQueryParamsSchema))
    getMyWellnessCheckInsQueryParams: TGetMyWellnessCheckInsQueryParams
  ): Promise<TGetMyWellnessCheckInsVo> {
    return this.wellnessService.getMyWellnessCheckIns(getMyWellnessCheckInsQueryParams);
  }
}
