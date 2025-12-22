import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import {
  createCommentRoSchema,
  type TCreateCommentVo,
  type TCreateCommentRo,
  type TReplyCommentParams,
  type TReplyCommentRo,
  type TReplyCommentVo,
  replyCommentRoSchema,
  type TEditCommentParams,
  type TEditCommentRo,
  type TEditCommentVo,
  editCommentRoSchema,
  type TDeleteCommentParams,
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

  @Put(':commentId')
  @HttpCode(HttpStatus.OK)
  async editComment(
    @Param() editCommentParams: TEditCommentParams,
    @Body(new ZodValidationPipe(editCommentRoSchema)) editCommentRo: TEditCommentRo
  ): Promise<TEditCommentVo> {
    return this.commentService.editComment(editCommentParams, editCommentRo);
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param() deleteCommentParams: TDeleteCommentParams): Promise<void> {
    await this.commentService.deleteComment(deleteCommentParams);
  }
}
