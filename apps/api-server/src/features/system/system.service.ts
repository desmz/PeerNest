import { Injectable } from '@nestjs/common';
import {
  TCreateInterestRo,
  TCreateInterestVo,
  TCreatePersonalGoalRo,
  TCreatePersonalGoalVo,
  TCreateWellnessFactorRo,
  TCreateWellnessFactorVo,
  TCreateWellnessMoodRo,
  TCreateWellnessMoodVo,
  TCreateWellnessSymptomRo,
  TCreateWellnessSymptomVo,
  TGetDomainsVo,
  TGetInterestsVo,
  TGetPersonalGoalsVo,
  TGetPronounsVo,
  TGetUniversityVo,
  TGetWellnessFactorsVo,
  TGetWellnessMoodsVo,
  TGetWellnessSymptomsVo,
  TUpdateInterestParams,
  TUpdateInterestRo,
  TUpdateInterestVo,
  TUpdatePersonalGoalParams,
  TUpdatePersonalGoalRo,
  TUpdatePersonalGoalVo,
  TUpdateWellnessFactorParams,
  TUpdateWellnessFactorRo,
  TUpdateWellnessFactorVo,
  TUpdateWellnessMoodParams,
  TUpdateWellnessMoodRo,
  TUpdateWellnessMoodVo,
  TUpdateWellnessSymptomParams,
  TUpdateWellnessSymptomRo,
  TUpdateWellnessSymptomVo,
} from '@peernest/contract';
import {
  generateInterestId,
  generatePersonalGoalId,
  generateWellnessFactorId,
  generateWellnessMoodId,
  generateWellnessSymptomId,
  HttpErrorCode,
} from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';
import {
  DomainRepository,
  InterestRepository,
  PersonalGoalRepository,
  PronounRepository,
  UniversityRepository,
  WellnessFactorCategoryRepository,
  WellnessFactorRepository,
  WellnessMoodRepository,
  WellnessSymptomCategoryRepository,
  WellnessSymptomRepository,
} from '@/persistence/repos/system';

@Injectable()
export class SystemService {
  constructor(
    private readonly domainRepository: DomainRepository,
    private readonly interestRepository: InterestRepository,
    private readonly personalGoalRepository: PersonalGoalRepository,
    private readonly pronounRepository: PronounRepository,
    private readonly wellnessMoodRepository: WellnessMoodRepository,
    private readonly wellnessFactorRepository: WellnessFactorRepository,
    private readonly wellnessFactorCategoryRepository: WellnessFactorCategoryRepository,
    private readonly wellnessSymptomRepository: WellnessSymptomRepository,
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

  async createInterest(createInterestRo: TCreateInterestRo): Promise<TCreateInterestVo> {
    const { interestName } = createInterestRo;

    const interestMaxPosition = await this.interestRepository.findMaxPosition();

    const existingInterest = await this.interestRepository.findInterestByName(interestName);

    if (existingInterest) {
      throw new CustomHttpException(
        `Interest ${interestName} already exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    const interest = await this.interestRepository.createInterest({
      interestId: generateInterestId(),
      interestName: interestName,
      interestPosition: interestMaxPosition + 1,
      interestCreatedTime: now,
    });

    return {
      interestId: interest.interestId,
      interestName: interest.interestName,
      interestPosition: interest.interestPosition,
    };
  }

  async updateInterest(
    updateInterestParams: TUpdateInterestParams,
    updateInterestRo: TUpdateInterestRo
  ): Promise<TUpdateInterestVo> {
    const { interestId } = updateInterestParams;
    const { interestName } = updateInterestRo;

    const interest = await this.interestRepository.findInterestById(interestId);

    if (!interest) {
      throw new CustomHttpException(
        `Interest ${interestId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const updatedInterest = await this.interestRepository.updateInterestById(
      {
        interestName: interestName,
        interestUpdatedTime: now,
      },
      interestId
    );

    return {
      interestId: updatedInterest.interestId,
      interestName: updatedInterest.interestName,
      interestPosition: updatedInterest.interestPosition,
    };
  }

  async createPersonalGoal(
    createPersonalGoalRo: TCreatePersonalGoalRo
  ): Promise<TCreatePersonalGoalVo> {
    const { personalGoalTitle } = createPersonalGoalRo;

    const personalGoalMaxPosition = await this.personalGoalRepository.findMaxPosition();

    const existingPersonalGoal =
      await this.personalGoalRepository.findPersonalGoalByTitle(personalGoalTitle);

    if (existingPersonalGoal) {
      throw new CustomHttpException(
        `Personal Goal ${personalGoalTitle} already exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    const personalGoal = await this.personalGoalRepository.createPersonalGoal({
      personalGoalId: generatePersonalGoalId(),
      personalGoalTitle: personalGoalTitle,
      personalGoalPosition: personalGoalMaxPosition + 1,
      personalGoalCreatedTime: now,
    });

    return {
      personalGoalId: personalGoal.personalGoalId,
      personalGoalTitle: personalGoal.personalGoalTitle,
      personalGoalName: personalGoal.personalGoalName,
      personalGoalDescription: personalGoal.personalGoalDescription,
      personalGoalPosition: personalGoal.personalGoalPosition,
    };
  }

  async updatePersonalGoal(
    updatePersonalGoalParams: TUpdatePersonalGoalParams,
    updatePersonalGoalRo: TUpdatePersonalGoalRo
  ): Promise<TUpdatePersonalGoalVo> {
    const { personalGoalId } = updatePersonalGoalParams;
    const { personalGoalTitle } = updatePersonalGoalRo;

    const personalGoal = await this.personalGoalRepository.findPersonalGoalById(personalGoalId);

    if (!personalGoal) {
      throw new CustomHttpException(
        `Personal Goal ${personalGoalId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const updatedPersonalGoal = await this.personalGoalRepository.updatePersonalGoalById(
      {
        personalGoalTitle: personalGoalTitle,
        personalGoalUpdatedTime: now,
      },
      personalGoalId
    );

    return {
      personalGoalId: updatedPersonalGoal.personalGoalId,
      personalGoalTitle: updatedPersonalGoal.personalGoalTitle,
      personalGoalName: updatedPersonalGoal.personalGoalName,
      personalGoalDescription: updatedPersonalGoal.personalGoalDescription,
      personalGoalPosition: updatedPersonalGoal.personalGoalPosition,
    };
  }

  async createWellnessMood(
    createWellnessMoodRo: TCreateWellnessMoodRo
  ): Promise<TCreateWellnessMoodVo> {
    const { wellnessMoodName } = createWellnessMoodRo;

    const wellnessMoodMaxPosition = await this.wellnessMoodRepository.findMaxPosition();

    const existingWellnessMood =
      await this.wellnessMoodRepository.findWellnessMoodByName(wellnessMoodName);

    if (existingWellnessMood) {
      throw new CustomHttpException(
        `Wellness Mood ${wellnessMoodName} already exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    const wellnessMood = await this.wellnessMoodRepository.createWellnessMood({
      wellnessMoodId: generateWellnessMoodId(),
      wellnessMoodName: wellnessMoodName,
      wellnessMoodPosition: wellnessMoodMaxPosition + 1,
      wellnessMoodCreatedTime: now,
    });

    return {
      wellnessMoodId: wellnessMood.wellnessMoodId,
      wellnessMoodName: wellnessMood.wellnessMoodName,
      wellnessMoodPosition: wellnessMood.wellnessMoodPosition,
    };
  }

  async updateWellnessMood(
    updateWellnessMoodParams: TUpdateWellnessMoodParams,
    updateWellnessMoodRo: TUpdateWellnessMoodRo
  ): Promise<TUpdateWellnessMoodVo> {
    const { wellnessMoodId } = updateWellnessMoodParams;
    const { wellnessMoodName } = updateWellnessMoodRo;

    const wellnessMood = await this.wellnessMoodRepository.findWellnessMoodById(wellnessMoodId);

    if (!wellnessMood) {
      throw new CustomHttpException(
        `Wellness Mood ${wellnessMoodId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const updatedWellnessMood = await this.wellnessMoodRepository.updateWellnessMoodById(
      {
        wellnessMoodName: wellnessMoodName,
        wellnessMoodUpdatedTime: now,
      },
      wellnessMoodId
    );

    return {
      wellnessMoodId: updatedWellnessMood.wellnessMoodId,
      wellnessMoodName: updatedWellnessMood.wellnessMoodName,
      wellnessMoodPosition: updatedWellnessMood.wellnessMoodPosition,
    };
  }

  async createWellnessSymptom(
    createWellnessSymptomRo: TCreateWellnessSymptomRo
  ): Promise<TCreateWellnessSymptomVo> {
    const { wellnessSymptomName, wellnessSymptomWellnessSymptomCategoryId: categoryId } =
      createWellnessSymptomRo;

    const wellnessSymptomCategory =
      await this.wellnessSymptomCategoryRepository.findWellnessSymptomCategoryById(categoryId);

    if (!wellnessSymptomCategory) {
      throw new CustomHttpException(
        `Wellness Symptom Category ${categoryId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const wellnessSymptomMaxPosition = await this.wellnessSymptomRepository.findMaxPosition();

    const existingWellnessSymptom =
      await this.wellnessSymptomRepository.findWellnessSymptomByName(wellnessSymptomName);

    if (existingWellnessSymptom) {
      throw new CustomHttpException(
        `Wellness Symptom ${wellnessSymptomName} already exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    const wellnessSymptom = await this.wellnessSymptomRepository.createWellnessSymptom({
      wellnessSymptomId: generateWellnessSymptomId(),
      wellnessSymptomName: wellnessSymptomName,
      wellnessSymptomWellnessSymptomCategoryId: categoryId,
      wellnessSymptomPosition: wellnessSymptomMaxPosition + 1,
      wellnessSymptomCreatedTime: now,
    });

    return {
      wellnessSymptomId: wellnessSymptom.wellnessSymptomId,
      wellnessSymptomName: wellnessSymptom.wellnessSymptomName,
      wellnessSymptomPosition: wellnessSymptom.wellnessSymptomPosition,
      wellnessSymptomCategory: {
        wellnessSymptomCategoryId: wellnessSymptomCategory.wellnessSymptomCategoryId,
        wellnessSymptomCategoryName: wellnessSymptomCategory.wellnessSymptomCategoryName,
        wellnessSymptomCategoryPosition: wellnessSymptomCategory.wellnessSymptomCategoryPosition,
      },
    };
  }

  async updateWellnessSymptom(
    updateWellnessSymptomParams: TUpdateWellnessSymptomParams,
    updateWellnessSymptomRo: TUpdateWellnessSymptomRo
  ): Promise<TUpdateWellnessSymptomVo> {
    const { wellnessSymptomId } = updateWellnessSymptomParams;
    const { wellnessSymptomName } = updateWellnessSymptomRo;

    const wellnessSymptom =
      await this.wellnessSymptomRepository.findWellnessSymptomById(wellnessSymptomId);

    if (!wellnessSymptom) {
      throw new CustomHttpException(
        `Wellness Symptom ${wellnessSymptomId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const updatedWellnessSymptom = await this.wellnessSymptomRepository.updateWellnessSymptomById(
      {
        wellnessSymptomName: wellnessSymptomName,
        wellnessSymptomUpdatedTime: now,
      },
      wellnessSymptomId
    );

    return {
      wellnessSymptomId: updatedWellnessSymptom.wellnessSymptomId,
      wellnessSymptomName: updatedWellnessSymptom.wellnessSymptomName,
      wellnessSymptomPosition: updatedWellnessSymptom.wellnessSymptomPosition,
      wellnessSymptomCategory: {
        wellnessSymptomCategoryId: wellnessSymptom.wellnessSymptomCategoryId,
        wellnessSymptomCategoryName: wellnessSymptom.wellnessSymptomCategoryName,
        wellnessSymptomCategoryPosition: wellnessSymptom.wellnessSymptomCategoryPosition,
      },
    };
  }

  async createWellnessFactor(
    createWellnessFactorRo: TCreateWellnessFactorRo
  ): Promise<TCreateWellnessFactorVo> {
    const { wellnessFactorName, wellnessFactorWellnessFactorCategoryId: categoryId } =
      createWellnessFactorRo;

    const wellnessFactorCategory =
      await this.wellnessFactorCategoryRepository.findWellnessFactorCategoryById(categoryId);

    if (!wellnessFactorCategory) {
      throw new CustomHttpException(
        `Wellness Factor Category ${categoryId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const wellnessFactorMaxPosition = await this.wellnessFactorRepository.findMaxPosition();

    const existingWellnessFactor =
      await this.wellnessFactorRepository.findWellnessFactorByName(wellnessFactorName);

    if (existingWellnessFactor) {
      throw new CustomHttpException(
        `Wellness Factor ${wellnessFactorName} already exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    const wellnessFactor = await this.wellnessFactorRepository.createWellnessFactor({
      wellnessFactorId: generateWellnessFactorId(),
      wellnessFactorName: wellnessFactorName,
      wellnessFactorWellnessFactorCategoryId: categoryId,
      wellnessFactorPosition: wellnessFactorMaxPosition + 1,
      wellnessFactorCreatedTime: now,
    });

    return {
      wellnessFactorId: wellnessFactor.wellnessFactorId,
      wellnessFactorName: wellnessFactor.wellnessFactorName,
      wellnessFactorPosition: wellnessFactor.wellnessFactorPosition,
      wellnessFactorCategory: {
        wellnessFactorCategoryId: wellnessFactorCategory.wellnessFactorCategoryId,
        wellnessFactorCategoryName: wellnessFactorCategory.wellnessFactorCategoryName,
        wellnessFactorCategoryPosition: wellnessFactorCategory.wellnessFactorCategoryPosition,
      },
    };
  }

  async updateWellnessFactor(
    updateWellnessFactorParams: TUpdateWellnessFactorParams,
    updateWellnessFactorRo: TUpdateWellnessFactorRo
  ): Promise<TUpdateWellnessFactorVo> {
    const { wellnessFactorId } = updateWellnessFactorParams;
    const { wellnessFactorName } = updateWellnessFactorRo;

    const wellnessFactor =
      await this.wellnessFactorRepository.findWellnessFactorById(wellnessFactorId);

    if (!wellnessFactor) {
      throw new CustomHttpException(
        `Wellness Factor ${wellnessFactorId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const updatedWellnessFactor = await this.wellnessFactorRepository.updateWellnessFactorById(
      {
        wellnessFactorName: wellnessFactorName,
        wellnessFactorUpdatedTime: now,
      },
      wellnessFactorId
    );

    return {
      wellnessFactorId: updatedWellnessFactor.wellnessFactorId,
      wellnessFactorName: updatedWellnessFactor.wellnessFactorName,
      wellnessFactorPosition: updatedWellnessFactor.wellnessFactorPosition,
      wellnessFactorCategory: {
        wellnessFactorCategoryId: wellnessFactor.wellnessFactorCategoryId,
        wellnessFactorCategoryName: wellnessFactor.wellnessFactorCategoryName,
        wellnessFactorCategoryPosition: wellnessFactor.wellnessFactorCategoryPosition,
      },
    };
  }
}
