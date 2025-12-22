import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  createCommentRoSchema,
  type TCreateCommentVo,
  type TCreateCommentRo,
  type TReplyCommentParams,
  type TReplyCommentRo,
  type TReplyCommentVo,
  replyCommentRoSchema,
} from '@peernest/contract';

import { CommentService } from '@/features/comment/comment.service';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Body(new ZodValidationPipe(createCommentRoSchema)) createCommentRo: TCreateCommentRo
  ): Promise<TCreateCommentVo> {
    return this.commentService.createComment(createCommentRo);
  }

  @Post(':commentId/replies')
  @HttpCode(HttpStatus.CREATED)
  async replyComment(
    @Param() replyCommentParams: TReplyCommentParams,
    @Body(new ZodValidationPipe(replyCommentRoSchema)) replyCommentRo: TReplyCommentRo
  ): Promise<TReplyCommentVo> {
    return this.commentService.replyComment(replyCommentParams, replyCommentRo);
  }
}
