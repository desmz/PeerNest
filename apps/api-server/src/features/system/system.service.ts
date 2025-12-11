import { Injectable } from '@nestjs/common';
import { TGetPronounsVo, TGetUniversityVo } from '@peernest/contract';
import { HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';

import { PronounRepository } from './repos/pronoun.repo';
import { UniversityRepository } from './repos/university.repo';

@Injectable()
export class SystemService {
  constructor(
    private readonly pronounRepository: PronounRepository,
    private readonly universityRepository: UniversityRepository
  ) {}

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

  async getUniversities(): Promise<TGetUniversityVo> {
    const universities = await this.universityRepository.findUniversities({
      orderBy: 'universityName',
    });

    if (!universities) {
      throw new CustomHttpException(
        'Pronouns is not avalaible',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return universities.map(({ universityId, universityName, universityCountry }) => ({
      universityId,
      universityName,
      universityCountry,
    }));
  }
}
