import { Injectable } from '@nestjs/common';
import {
  TGetDomainsVo,
  TGetInterestsVo,
  TGetPronounsVo,
  TGetUniversityVo,
} from '@peernest/contract';
import { HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';

import { DomainRepository } from './repos/domain.repo';
import { InterestRepository } from './repos/interest.repo';
import { PronounRepository } from './repos/pronoun.repo';
import { UniversityRepository } from './repos/university.repo';

@Injectable()
export class SystemService {
  constructor(
    private readonly domainRepository: DomainRepository,
    private readonly interestRepository: InterestRepository,
    private readonly pronounRepository: PronounRepository,
    private readonly universityRepository: UniversityRepository
  ) {}

  async getPronouns(): Promise<TGetPronounsVo> {
    const pronouns = await this.pronounRepository.findPronouns({ orderBy: 'pronounName' });

    if (!pronouns) {
      throw new CustomHttpException(
        'Pronoun is not available',
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
        'University is not available',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return universities.map(({ universityId, universityName, universityCountry }) => ({
      universityId,
      universityName,
      universityCountry,
    }));
  }

  async getDomains(): Promise<TGetDomainsVo> {
    const domains = await this.domainRepository.findDomains({ orderBy: 'domainName' });

    if (!domains) {
      throw new CustomHttpException('Domain is not available', HttpErrorCode.INTERNAL_SERVER_ERROR);
    }

    return domains.map(({ domainId, domainName }) => ({ domainId, domainName }));
  }

  async getInterests(): Promise<TGetInterestsVo> {
    const domains = await this.interestRepository.findInterests({ orderBy: 'interestPosition' });

    if (!domains) {
      throw new CustomHttpException(
        'Interests is not available',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return domains.map(({ interestId, interestName, interestPosition }) => ({
      interestId,
      interestName,
      interestPosition,
    }));
  }
}
