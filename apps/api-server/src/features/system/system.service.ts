import { Injectable } from '@nestjs/common';
import { TGetPronounsVo } from '@peernest/contract';
import { HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';

import { PronounRepository } from './repos/pronoun.repo';

@Injectable()
export class SystemService {
  constructor(private readonly pronounRepository: PronounRepository) {}

  async getPronouns(): Promise<TGetPronounsVo> {
    const pronouns = await this.pronounRepository.findPronouns({ orderBy: 'pronounName' });

    if (!pronouns) {
      throw new CustomHttpException(
        'Pronouns is not avalaible',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return pronouns.map(({ pronounId, pronounName }) => ({ pronounId, pronounName }));
  }
}
