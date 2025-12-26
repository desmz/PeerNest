import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  createWellnessCheckInRoSchema,
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
}
