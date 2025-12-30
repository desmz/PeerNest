import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  releaseReportedContentParamsSchema,
  type TReleaseReportedContentParams,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';

import { Roles } from '@/features/auth/decorators/roles.decorator';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { ReportService } from './report.service';

@Controller('api/manage/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(UserRole.Admin, UserRole.Moderator)
  @Post(':reportId/release')
  @HttpCode(HttpStatus.NO_CONTENT)
  async releaseReportedContent(
    @Param(new ZodValidationPipe(releaseReportedContentParamsSchema))
    releaseReportedContentParams: TReleaseReportedContentParams
  ): Promise<void> {
    await this.reportService.releaseReportedContent(releaseReportedContentParams);
  }
}
