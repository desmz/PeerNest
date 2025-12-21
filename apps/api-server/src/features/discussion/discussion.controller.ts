import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { type TCreateDiscussionRo, type TCreateDiscussionVo } from '@peernest/contract';

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
}
