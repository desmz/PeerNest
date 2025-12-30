import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  getDiscussionQueryParamsSchema,
  type TGetDiscussionParams,
  type TGetDiscussionQueryParams,
  type TGetDiscussionVo,
  type TCreateDiscussionRo,
  type TCreateDiscussionVo,
  type TEditDiscussionParams,
  editDiscussionRoSchema,
  type TEditDiscussionRo,
  type TEditDiscussionVo,
  createDiscussionRoSchema,
  type TDeleteDiscussionParams,
  type TLikeDiscussionParams,
  type TUnlikeDiscussionParams,
  type TReportDiscussionParams,
  type TFindDiscussionCommentsVo,
  type TFindDiscussionCommentsParams,
  findDiscussionCommentsQueryParamsSchema,
  type TFindDiscussionCommentsQueryParams,
  findDiscussionsQueryParamsSchema,
  type TFindDiscussionsQueryParams,
  type TFindDiscussionsVo,
  type TArchiveDiscussionParams,
  type TUnarchiveDiscussionParams,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { Roles } from '../auth/decorators/roles.decorator';

import { DiscussionService } from './discussion.service';

@Controller('api/discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDiscussion(
    @Body(new ZodValidationPipe(createDiscussionRoSchema)) createDiscussionRo: TCreateDiscussionRo
  ): Promise<TCreateDiscussionVo> {
    return this.discussionService.createDiscussion(createDiscussionRo);
  }

  @Get(':discussionId')
  @HttpCode(HttpStatus.OK)
  async getDiscussion(
    @Param() getDiscussionParams: TGetDiscussionParams,
    @Query(new ZodValidationPipe(getDiscussionQueryParamsSchema))
    getDiscussionQueryParam: TGetDiscussionQueryParams
  ): Promise<TGetDiscussionVo> {
    return this.discussionService.getDiscussion(getDiscussionParams, getDiscussionQueryParam);
  }

  @Put(':discussionId')
  @HttpCode(HttpStatus.OK)
  async editDiscussion(
    @Param() editDiscussionParams: TEditDiscussionParams,
    @Body(new ZodValidationPipe(editDiscussionRoSchema)) editDiscussionRo: TEditDiscussionRo
  ): Promise<TEditDiscussionVo> {
    return this.discussionService.editDiscussion(editDiscussionParams, editDiscussionRo);
  }

  @Delete(':discussionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDiscussion(@Param() deleteDiscussionParams: TDeleteDiscussionParams): Promise<void> {
    await this.discussionService.deleteDiscussion(deleteDiscussionParams);
  }

  @Post(':discussionId/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeDiscussion(@Param() likeDiscussionParams: TLikeDiscussionParams): Promise<void> {
    await this.discussionService.likeDiscussion(likeDiscussionParams);
  }

  @Delete(':discussionId/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikeDiscussion(@Param() unlikeDiscussionParams: TUnlikeDiscussionParams): Promise<void> {
    await this.discussionService.unlikeDiscussion(unlikeDiscussionParams);
  }

  @Post(':discussionId/reports')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportDiscussion(@Param() reportDiscussionParams: TReportDiscussionParams): Promise<void> {
    await this.discussionService.reportDiscussion(reportDiscussionParams);
  }

  @Get(':discussionId/comments')
  @HttpCode(HttpStatus.OK)
  async findDiscussionComments(
    @Param() findDiscussionCommentsParams: TFindDiscussionCommentsParams,
    @Query(new ZodValidationPipe(findDiscussionCommentsQueryParamsSchema))
    findDiscussionCommentsQueryParams: TFindDiscussionCommentsQueryParams
  ): Promise<TFindDiscussionCommentsVo> {
    return this.discussionService.findDiscussionComments(
      findDiscussionCommentsParams,
      findDiscussionCommentsQueryParams
    );
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async findDiscussions(
    @Query(new ZodValidationPipe(findDiscussionsQueryParamsSchema))
    findDiscussionsQueryParams: TFindDiscussionsQueryParams
  ): Promise<TFindDiscussionsVo> {
    return this.discussionService.findDiscussions(findDiscussionsQueryParams);
  }

  @Roles(UserRole.Admin, UserRole.Moderator)
  @Post(':discussionId/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archiveDiscussion(
    @Param() archiveDiscussionParams: TArchiveDiscussionParams
  ): Promise<void> {
    await this.discussionService.archiveDiscussion(archiveDiscussionParams);
  }

  @Roles(UserRole.Admin, UserRole.Moderator)
  @Post(':discussionId/unarchive')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unarchiveDiscussion(
    @Param() unarchiveDiscussionParams: TUnarchiveDiscussionParams
  ): Promise<void> {
    await this.discussionService.unarchiveDiscussion(unarchiveDiscussionParams);
  }
}
