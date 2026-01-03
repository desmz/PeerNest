import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
  addPercherRoSchema,
  type TUpdatePercherNoteParams,
  type TUpdatePercherNoteRo,
  updatePercherNoteRoSchema,
  type TAddPercherRo,
  type TReleasePercherParams,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';

import { Roles } from '@/features/auth/decorators/roles.decorator';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { CounselorService } from './counselor.service';

@Controller('api/counselors')
export class CounselorController {
  constructor(private readonly counselorService: CounselorService) {}

  @Roles(UserRole.Counselor)
  @Post('me/perchers')
  @HttpCode(HttpStatus.CREATED)
  async addPercher(
    @Body(new ZodValidationPipe(addPercherRoSchema)) addPercherRo: TAddPercherRo
  ): Promise<void> {
    await this.counselorService.addPercher(addPercherRo);
  }

  @Roles(UserRole.Counselor)
  @Patch('me/perchers/:percherId/note')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePercherNote(
    @Param() updatePercherNoteParams: TUpdatePercherNoteParams,
    @Body(new ZodValidationPipe(updatePercherNoteRoSchema))
    updatePercherNoteRo: TUpdatePercherNoteRo
  ): Promise<void> {
    await this.counselorService.updatePercherNote(updatePercherNoteParams, updatePercherNoteRo);
  }

  @Roles(UserRole.Counselor)
  @Post('me/perchers/:percherId/release')
  @HttpCode(HttpStatus.NO_CONTENT)
  async releasePercher(@Param() releasePercherParams: TReleasePercherParams): Promise<void> {
    await this.counselorService.releasePercher(releasePercherParams);
  }
}
