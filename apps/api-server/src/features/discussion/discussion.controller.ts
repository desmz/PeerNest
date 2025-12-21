import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  getDiscussionQueryParamsSchema,
  type TGetDiscussionParams,
  type TGetDiscussionQueryParams,
  type TGetDiscussionVo,
  type TCreateDiscussionRo,
  type TCreateDiscussionVo,
} from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { DiscussionService } from './discussion.service';

@Controller('api/discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDiscussion(
    @Body() createDiscussionRo: TCreateDiscussionRo
  ): Promise<TCreateDiscussionVo> {
    return this.discussionService.createDiscussion(createDiscussionRo);
  }

  @Get(':discussionId')
  @HttpCode(HttpStatus.OK)
  async getDiscussion(
    @Param() getDiscussionParam: TGetDiscussionParams,
    @Query(new ZodValidationPipe(getDiscussionQueryParamsSchema))
    getDiscussionQueryParam: TGetDiscussionQueryParams
  ): Promise<TGetDiscussionVo> {
    return this.discussionService.getDiscussion(getDiscussionParam, getDiscussionQueryParam);
  }
}
