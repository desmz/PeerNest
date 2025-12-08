import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_OAUTH_STRATEGY_NAME } from '@peernest/core';

@Injectable()
export class GoogleGuard extends AuthGuard(GOOGLE_OAUTH_STRATEGY_NAME) {}
