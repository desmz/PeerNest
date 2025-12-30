import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  deleteReportedContentParamsSchema,
  findReportedContentsQueryParamsSchema,
  releaseReportedContentParamsSchema,
  type TFindReportedContentsQueryParams,
  type TFindReportedContentsVo,
  type TDeleteReportedContentParams,
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

  @Roles(UserRole.Admin, UserRole.Moderator)
  @Post(':reportId/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReportedContent(
    @Param(new ZodValidationPipe(deleteReportedContentParamsSchema))
    deleteReportedContentParams: TDeleteReportedContentParams
  ): Promise<void> {
    await this.reportService.deleteReportedContent(deleteReportedContentParams);
  }

  @Roles(UserRole.Admin, UserRole.Moderator)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findReportedContents(
    @Query(new ZodValidationPipe(findReportedContentsQueryParamsSchema))
    findReportedContentsQueryParams: TFindReportedContentsQueryParams
  ): Promise<TFindReportedContentsVo> {
    return this.reportService.findReportedContents(findReportedContentsQueryParams);
  }
}
