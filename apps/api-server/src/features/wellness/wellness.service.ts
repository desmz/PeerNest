import { Injectable } from '@nestjs/common';
import {
  TCheckInHealthMeasurement,
  TCreateWellnessCheckInRo,
  TCreateWellnessCheckInVo,
  TGetMyWellnessCheckInsQueryParams,
  TGetMyWellnessCheckInsVo,
  TWellnessMood,
} from '@peernest/contract';
import {
  generateCheckInHealthMeasurementId,
  generateCheckInId,
  generateCheckInWellnessFactorId,
  generateCheckInWellnessMoodId,
  generateCheckInWellnessSymptomId,
  getStartOfDay,
  HttpErrorCode,
  sortStringCompareFn,
} from '@peernest/core';
import {
  executeTx,
  KyselyService,
  TInsertableCheckInWellnessFactor,
  TInsertableCheckInWellnessMood,
  TInsertableCheckInWellnessSymptom,
} from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import {
  WellnessFactorRepository,
  WellnessMoodRepository,
  WellnessSymptomRepository,
} from '@/persistence/repos/system';
import {
  CheckInHealthMeasurementRepository,
  CheckInRepository,
  CheckInWellnessFactorRepository,
  CheckInWellnessMoodRepository,
  CheckInWellnessSymptomRepository,
} from '@/persistence/repos/wellness';
import { IClsStore } from '@/types/cls';

import { TWellnessFactorWithCategory, TWellnessSymptomWithCategory } from './types';

@Injectable()
export class WellnessService {
  constructor(
    private readonly kyselyService: KyselyService,
    private readonly clsService: ClsService<IClsStore>,

    private readonly checkInRepository: CheckInRepository,
    private readonly checkInWellnessFactorRepository: CheckInWellnessFactorRepository,
    private readonly checkInWellnessSymptomRepository: CheckInWellnessSymptomRepository,
    private readonly checkInWellnessMoodRepository: CheckInWellnessMoodRepository,
    private readonly checkInHealthMeasurementRepository: CheckInHealthMeasurementRepository,
    private readonly wellnessMoodRepository: WellnessMoodRepository,
    private readonly wellnessFactorRepository: WellnessFactorRepository,
    private readonly wellnessSymptomRepository: WellnessSymptomRepository
  ) {}

  async createWellnessCheckIn(
    createWellnessCheckInRo: TCreateWellnessCheckInRo
  ): Promise<TCreateWellnessCheckInVo> {
    const {
      wellnessMoodIds,
      wellnessSymptomIds,
      wellnessFactorIds,
      checkInHealthMeasurement,
      ...otherCreateWellnessCheckInRo
    } = createWellnessCheckInRo;

    const userId = this.clsService.get('user.id');

    const now = new Date();
    const existingCheckIn = await this.checkInRepository.findCheckInByUserId(userId, {
      from: getStartOfDay(now),
    });

    if (existingCheckIn) {
      throw new CustomHttpException(
        'You already check in today. Please check in on the next day',
        HttpErrorCode.CONFLICT
      );
    }

    const systemWellnessMoodRows = await this.wellnessMoodRepository.findWellnessMoods();
    const systemWellnessMood = new Set(
      systemWellnessMoodRows.map((systemWellnessMoodRow) => systemWellnessMoodRow.wellnessMoodId)
    );
    const filteredWellnessMoodIds = wellnessMoodIds?.filter((wellnessMoodId) =>
      systemWellnessMood.has(wellnessMoodId)
    );

    const systemWellnessSymptomRows = await this.wellnessSymptomRepository.findWellnessSymptoms();
    const systemWellnessSymptom = new Set(
      systemWellnessSymptomRows.map(
        (systemWellnessSymptomRow) => systemWellnessSymptomRow.wellnessSymptomId
      )
    );
    const filteredWellnessSymptomIds = wellnessSymptomIds?.filter((wellnessSymptomId) =>
      systemWellnessSymptom.has(wellnessSymptomId)
    );

    const systemWellnessFactorRows = await this.wellnessFactorRepository.findWellnessFactors();
    const systemWellnessFactor = new Set(
      systemWellnessFactorRows.map(
        (systemWellnessFactorRow) => systemWellnessFactorRow.wellnessFactorId
      )
    );
    const filteredWellnessFactorIds = wellnessFactorIds?.filter((wellnessFactorId) =>
      systemWellnessFactor.has(wellnessFactorId)
    );

    const checkIn = await executeTx(this.kyselyService.db, async (tx) => {
      const checkInId = generateCheckInId();

      const checkIn = await this.checkInRepository.createCheckIn(
        {
          ...otherCreateWellnessCheckInRo,
          checkInId: checkInId,
          checkInUserId: userId,
          checkInCreatedTime: now,
        },
        tx
      );

      if (filteredWellnessMoodIds && filteredWellnessMoodIds.length > 0) {
        const checkInWellnessMoodObjs: TInsertableCheckInWellnessMood[] =
          filteredWellnessMoodIds.map((filteredWellnessMoodId) => ({
            checkInWellnessMoodId: generateCheckInWellnessMoodId(),
            checkInWellnessMoodCheckInId: checkInId,
            checkInWellnessMoodWellnessMoodId: filteredWellnessMoodId,
          }));

        await this.checkInWellnessMoodRepository.createCheckInWellnessMoods(
          checkInWellnessMoodObjs,
          tx
        );
      }

      if (filteredWellnessSymptomIds && filteredWellnessSymptomIds.length > 0) {
        const checkInWellnessSymptomObjs: TInsertableCheckInWellnessSymptom[] =
          filteredWellnessSymptomIds.map((filteredWellnessSymptomId) => ({
            checkInWellnessSymptomId: generateCheckInWellnessSymptomId(),
            checkInWellnessSymptomCheckInId: checkInId,
            checkInWellnessSymptomWellnessSymptomId: filteredWellnessSymptomId,
          }));

        await this.checkInWellnessSymptomRepository.createCheckInWellnessSymptoms(
          checkInWellnessSymptomObjs,
          tx
        );
      }

      if (filteredWellnessFactorIds && filteredWellnessFactorIds.length > 0) {
        const checkInWellnessFactorObjs: TInsertableCheckInWellnessFactor[] =
          filteredWellnessFactorIds.map((filteredWellnessFactorId) => ({
            checkInWellnessFactorId: generateCheckInWellnessFactorId(),
            checkInWellnessFactorCheckInId: checkInId,
            checkInWellnessFactorWellnessFactorId: filteredWellnessFactorId,
          }));

        await this.checkInWellnessFactorRepository.createCheckInWellnessFactors(
          checkInWellnessFactorObjs,
          tx
        );
      }

      if (checkInHealthMeasurement) {
        const { heartRate, stepCount, weight } = checkInHealthMeasurement;

        await this.checkInHealthMeasurementRepository.createCheckInHealthMeasurement(
          {
            checkInHealthMeasurementId: generateCheckInHealthMeasurementId(),
            checkInHealthMeasurementCheckInId: checkInId,
            checkInHealthMeasurementHeartRate: heartRate,
            checkInHealthMeasurementStepCount: stepCount,
            checkInHealthMeasurementWeight: weight,
          },
          tx
        );
      }

      return checkIn;
    });

    return {
      checkInId: checkIn.checkInId,
      checkInCheckInTime: checkIn.checkInCreatedTime,
    };
  }

  async getMyWellnessCheckIns(
    getMyWellnessCheckInsQueryParams: TGetMyWellnessCheckInsQueryParams
  ): Promise<TGetMyWellnessCheckInsVo> {
    const userId = this.clsService.get('user.id');

    const checkIns = await this.checkInRepository.findCheckInsByUserId(
      userId,
      getMyWellnessCheckInsQueryParams
    );

    const checkInIds = checkIns.map((checkIn) => checkIn.checkInId);

    // find four objects
    const [wellnessMoods, wellnessSymptoms, wellnessFactors, checkInHealthMeasurements] =
      await Promise.all([
        await this.checkInWellnessMoodRepository.findWellnessMoodsByCheckInIds(checkInIds),
        await this.checkInWellnessSymptomRepository.findWellnessSymptomsByCheckInIds(checkInIds),
        await this.checkInWellnessFactorRepository.findWellnessFactorsByCheckInIds(checkInIds),
        await this.checkInHealthMeasurementRepository.findCheckInMeasurementsByCheckInIds(
          checkInIds
        ),
      ]);

    // use map to assemble while formatting
    const wellnessMoodMap = new Map<string, TWellnessMood[]>();
    for (const wellnessMood of wellnessMoods) {
      const {
        checkInWellnessMoodCheckInId,
        wellnessMoodId,
        wellnessMoodName,
        wellnessMoodPosition,
      } = wellnessMood;

      if (!wellnessMoodMap.has(checkInWellnessMoodCheckInId)) {
        wellnessMoodMap.set(checkInWellnessMoodCheckInId, []);
      }

      wellnessMoodMap.get(checkInWellnessMoodCheckInId)!.push({
        wellnessMoodId,
        wellnessMoodName,
        wellnessMoodPosition,
      });
    }

    const wellnessSymptomMap = new Map<string, TWellnessSymptomWithCategory[]>();
    for (const wellnessSymptom of wellnessSymptoms) {
      const {
        checkInWellnessSymptomCheckInId,
        wellnessSymptomId,
        wellnessSymptomName,
        wellnessSymptomPosition,
        wellnessSymptomCategoryId,
        wellnessSymptomCategoryName,
        wellnessSymptomCategoryPosition,
      } = wellnessSymptom;

      if (!wellnessSymptomMap.has(checkInWellnessSymptomCheckInId)) {
        wellnessSymptomMap.set(checkInWellnessSymptomCheckInId, []);
      }

      wellnessSymptomMap.get(checkInWellnessSymptomCheckInId)!.push({
        wellnessSymptomId,
        wellnessSymptomName,
        wellnessSymptomPosition,
        wellnessSymptomCategory: {
          wellnessSymptomCategoryId,
          wellnessSymptomCategoryName,
          wellnessSymptomCategoryPosition,
        },
      });
    }

    const wellnessFactorMap = new Map<string, TWellnessFactorWithCategory[]>();
    for (const wellnessFactor of wellnessFactors) {
      const {
        checkInWellnessFactorCheckInId,
        wellnessFactorId,
        wellnessFactorName,
        wellnessFactorPosition,
        wellnessFactorCategoryId,
        wellnessFactorCategoryName,
        wellnessFactorCategoryPosition,
      } = wellnessFactor;

      if (!wellnessFactorMap.has(checkInWellnessFactorCheckInId)) {
        wellnessFactorMap.set(checkInWellnessFactorCheckInId, []);
      }

      wellnessFactorMap.get(checkInWellnessFactorCheckInId)!.push({
        wellnessFactorId,
        wellnessFactorName,
        wellnessFactorPosition,
        wellnessFactorCategory: {
          wellnessFactorCategoryId,
          wellnessFactorCategoryName,
          wellnessFactorCategoryPosition,
        },
      });
    }

    const checkInHealthMeasurementMap = new Map<string, TCheckInHealthMeasurement>();
    for (const checkInHealthMeasurement of checkInHealthMeasurements) {
      const {
        checkInHealthMeasurementCheckInId,
        checkInHealthMeasurementHeartRate,
        checkInHealthMeasurementStepCount,
        checkInHealthMeasurementWeight,
      } = checkInHealthMeasurement;

      checkInHealthMeasurementMap.set(checkInHealthMeasurementCheckInId, {
        hearRate: checkInHealthMeasurementHeartRate
          ? parseInt(checkInHealthMeasurementHeartRate)
          : null,
        stepCount: checkInHealthMeasurementStepCount
          ? parseInt(checkInHealthMeasurementStepCount)
          : null,
        weight: checkInHealthMeasurementWeight ? parseFloat(checkInHealthMeasurementWeight) : null,
      });
    }

    // construct the object, sort them by (category, item)
    const formattedCheckIns: TGetMyWellnessCheckInsVo['checkIns'] = [];

    for (const checkIn of checkIns) {
      const { checkInId } = checkIn;

      const wellnessMoods = wellnessMoodMap.get(checkInId);
      wellnessMoods?.sort((a, b) =>
        sortStringCompareFn(a.wellnessMoodPosition, b.wellnessMoodPosition)
      );

      const wellnessSymptoms = wellnessSymptomMap.get(checkInId);
      wellnessSymptoms?.sort((a, b) => {
        const aPos = a.wellnessSymptomPosition;
        const bPos = b.wellnessSymptomPosition;
        const aCategoryPos = a.wellnessSymptomCategory.wellnessSymptomCategoryPosition;
        const bCategoryPos = b.wellnessSymptomCategory.wellnessSymptomCategoryPosition;

        return aCategoryPos === bCategoryPos
          ? sortStringCompareFn(aPos, bPos)
          : sortStringCompareFn(aCategoryPos, bCategoryPos);
      });

      const wellnessFactors = wellnessFactorMap.get(checkInId);
      wellnessFactors?.sort((a, b) => {
        const aPos = a.wellnessFactorPosition;
        const bPos = b.wellnessFactorPosition;
        const aCategoryPos = a.wellnessFactorCategory.wellnessFactorCategoryPosition;
        const bCategoryPos = b.wellnessFactorCategory.wellnessFactorCategoryPosition;

        return aCategoryPos === bCategoryPos
          ? sortStringCompareFn(aPos, bPos)
          : sortStringCompareFn(aCategoryPos, bCategoryPos);
      });

      const formattedCheckIn: TGetMyWellnessCheckInsVo['checkIns'][number] = {
        checkInId,
        checkInCheckInTime: checkIn.checkInCheckInTime,
        checkInMoodRating: parseInt(checkIn.checkInMoodRating),
        checkInSleepQualityRating: checkIn.checkInSleepQualityRating
          ? parseInt(checkIn.checkInSleepQualityRating)
          : null,
        checkInSleepTime: checkIn.checkInSleepTime,
        wellnessMoods: wellnessMoods ? wellnessMoods : null,
        wellnessSymptoms: wellnessSymptoms ? wellnessSymptoms : null,
        wellnessFactors: wellnessFactors ? wellnessFactors : null,
        checkInHealthMeasurement: checkInHealthMeasurementMap.get(checkInId) || null,
      };

      formattedCheckIns.push(formattedCheckIn);
    }

    return {
      count: formattedCheckIns.length,
      checkIns: formattedCheckIns,
    };
  }
}
