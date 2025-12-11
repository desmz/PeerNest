import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { type TMeVo } from '@peernest/contract';
import { type Request } from 'express';

@Controller('api/me')
export class MeController {
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request): Promise<TMeVo> {
    return req.user as TMeVo;
  }
}
