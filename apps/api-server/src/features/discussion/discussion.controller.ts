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
} from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

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
}
