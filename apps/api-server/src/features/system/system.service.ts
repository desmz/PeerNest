import { Injectable } from '@nestjs/common';
import {
  TGetDomainsVo,
  TGetInterestsVo,
  TGetPersonalGoalsVo,
  TGetPronounsVo,
  TGetUniversityVo,
  TGetWellnessFactorsVo,
  TGetWellnessMoodsVo,
  TGetWellnessSymptomsVo,
} from '@peernest/contract';
import { HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';
import {
  DomainRepository,
  InterestRepository,
  PersonalGoalRepository,
  PronounRepository,
  UniversityRepository,
  WellnessFactorCategoryRepository,
  WellnessMoodRepository,
  WellnessSymptomCategoryRepository,
} from '@/persistence/repos/system';

@Injectable()
export class SystemService {
  constructor(
    private readonly domainRepository: DomainRepository,
    private readonly interestRepository: InterestRepository,
    private readonly personalGoalRepository: PersonalGoalRepository,
    private readonly pronounRepository: PronounRepository,
    private readonly wellnessMoodRepository: WellnessMoodRepository,
    private readonly wellnessFactorCategoryRepository: WellnessFactorCategoryRepository,
    private readonly wellnessSymptomCategoryRepository: WellnessSymptomCategoryRepository,
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

  async getPersonalGoals(): Promise<TGetPersonalGoalsVo> {
    const personalGoals = await this.personalGoalRepository.findPersonalGoals({
      orderBy: 'personalGoalPosition',
    });

    if (!personalGoals) {
      throw new CustomHttpException(
        'Personal goal is not available',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return personalGoals.map(
      ({
        personalGoalId,
        personalGoalTitle,
        personalGoalName,
        personalGoalDescription,
        personalGoalPosition,
      }) => ({
        personalGoalId,
        personalGoalTitle,
        personalGoalName,
        personalGoalDescription,
        personalGoalPosition,
      })
    );
  }

  async getWellnessMoods(): Promise<TGetWellnessMoodsVo> {
    const wellnessMoods = await this.wellnessMoodRepository.findWellnessMoods({
      orderBy: 'wellnessMoodPosition',
    });

    return wellnessMoods.map(({ wellnessMoodId, wellnessMoodName, wellnessMoodPosition }) => ({
      wellnessMoodId,
      wellnessMoodName,
      wellnessMoodPosition,
    }));
  }

  async getWellnessSymptoms(): Promise<TGetWellnessSymptomsVo> {
    const wellnessSymptomAggs =
      await this.wellnessSymptomCategoryRepository.findWellnessSymptomCategoryAggs({
        orderBy: 'position',
      });

    return wellnessSymptomAggs.map((wellnessSymptomAgg) => ({
      wellnessSymptomCategoryId: wellnessSymptomAgg.wellnessSymptomCategoryId,
      wellnessSymptomCategoryName: wellnessSymptomAgg.wellnessSymptomCategoryName,
      wellnessSymptomCategoryPosition: wellnessSymptomAgg.wellnessSymptomCategoryPosition,
      wellnessSymptoms: wellnessSymptomAgg.wellnessSymptoms.map((wellnessSymptom) => ({
        wellnessSymptomId: wellnessSymptom.wellnessSymptomId,
        wellnessSymptomName: wellnessSymptom.wellnessSymptomName,
        wellnessSymptomPosition: wellnessSymptom.wellnessSymptomPosition,
      })),
    }));
  }

  async getWellnessFactors(): Promise<TGetWellnessFactorsVo> {
    const wellnessFactorAggs =
      await this.wellnessFactorCategoryRepository.findWellnessFactorCategoryAggs({
        orderBy: 'position',
      });

    return wellnessFactorAggs.map((wellnessFactorAgg) => ({
      wellnessFactorCategoryId: wellnessFactorAgg.wellnessFactorCategoryId,
      wellnessFactorCategoryName: wellnessFactorAgg.wellnessFactorCategoryName,
      wellnessFactorCategoryPosition: wellnessFactorAgg.wellnessFactorCategoryPosition,
      wellnessFactors: wellnessFactorAgg.wellnessFactors.map((wellnessFactor) => ({
        wellnessFactorId: wellnessFactor.wellnessFactorId,
        wellnessFactorName: wellnessFactor.wellnessFactorName,
        wellnessFactorPosition: wellnessFactor.wellnessFactorPosition,
      })),
    }));
  }
}
