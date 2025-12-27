import { Injectable } from '@nestjs/common';
import {
  TCheckInHealthMeasurement,
  TCreateWellnessCheckInRo,
  TCreateWellnessCheckInVo,
  TGetMyWellnessCheckInParams,
  TGetMyWellnessCheckInsQueryParams,
  TGetMyWellnessCheckInsVo,
  TGetWellnessCheckInVo,
  TGetWellnessMoodsSummaryQueryParams,
  TGetWellnessMoodsSummaryVo,
  TGetWellnessSymptomsSummaryQueryParams,
  TGetWellnessSymptomsSummaryVo,
  TWellnessMood,
} from '@peernest/contract';
import {
  generateCheckInHealthMeasurementId,
  generateCheckInId,
  generateCheckInWellnessFactorId,
  generateCheckInWellnessMoodId,
  generateCheckInWellnessSymptomId,
  getDatesInInterval,
  getStartOfDay,
  HttpErrorCode,
  WELLNESS_MOODS_SUMMARY_DEFAULT_DAYS,
  WELLNESS_SYMPTOMS_SUMMARY_DEFAULT_DAYS,
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

import {
  TSelectableCheckInWithSleepTimeString,
  TWellnessFactorWithCategory,
  TWellnessSymptomWithCategory,
} from './types';
import { WellnessCheckInFormatter } from './wellness-check-in-formatter';

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
    private readonly wellnessSymptomRepository: WellnessSymptomRepository,
    private readonly wellnessCheckInFormatter: WellnessCheckInFormatter
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
      from: getStartOfDay(now).toDate(),
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

    const checkIns = (await this.checkInRepository.findCheckInsByUserId(
      userId,
      getMyWellnessCheckInsQueryParams
    )) as TSelectableCheckInWithSleepTimeString[];

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
      const { checkInWellnessMoodCheckInId } = wellnessMood;

      if (!wellnessMoodMap.has(checkInWellnessMoodCheckInId)) {
        wellnessMoodMap.set(checkInWellnessMoodCheckInId, []);
      }

      wellnessMoodMap
        .get(checkInWellnessMoodCheckInId)!
        .push(this.wellnessCheckInFormatter.formatWellnessMood(wellnessMood));
    }

    const wellnessSymptomMap = new Map<string, TWellnessSymptomWithCategory[]>();
    for (const wellnessSymptom of wellnessSymptoms) {
      const { checkInWellnessSymptomCheckInId } = wellnessSymptom;

      if (!wellnessSymptomMap.has(checkInWellnessSymptomCheckInId)) {
        wellnessSymptomMap.set(checkInWellnessSymptomCheckInId, []);
      }

      wellnessSymptomMap
        .get(checkInWellnessSymptomCheckInId)!
        .push(this.wellnessCheckInFormatter.formatWellnessSymptom(wellnessSymptom));
    }

    const wellnessFactorMap = new Map<string, TWellnessFactorWithCategory[]>();
    for (const wellnessFactor of wellnessFactors) {
      const { checkInWellnessFactorCheckInId } = wellnessFactor;

      if (!wellnessFactorMap.has(checkInWellnessFactorCheckInId)) {
        wellnessFactorMap.set(checkInWellnessFactorCheckInId, []);
      }

      wellnessFactorMap
        .get(checkInWellnessFactorCheckInId)!
        .push(this.wellnessCheckInFormatter.formatWellnessFactor(wellnessFactor));
    }

    const checkInHealthMeasurementMap = new Map<string, TCheckInHealthMeasurement>();
    for (const checkInHealthMeasurement of checkInHealthMeasurements) {
      const { checkInHealthMeasurementCheckInId } = checkInHealthMeasurement;

      checkInHealthMeasurementMap.set(
        checkInHealthMeasurementCheckInId,
        this.wellnessCheckInFormatter.formatCheckInHealthMeasurement(checkInHealthMeasurement)
      );
    }

    // construct the object, sort them by (category, item)
    const formattedCheckIns: TGetMyWellnessCheckInsVo['checkIns'] = [];

    for (const checkIn of checkIns) {
      const { checkInId } = checkIn;

      const wellnessMoods = wellnessMoodMap.get(checkInId);
      const wellnessSymptoms = wellnessSymptomMap.get(checkInId);
      const wellnessFactors = wellnessFactorMap.get(checkInId);
      const checkInHealthMeasurement = checkInHealthMeasurementMap.get(checkInId);

      const formattedCheckIn: TGetMyWellnessCheckInsVo['checkIns'][number] =
        this.wellnessCheckInFormatter.formatCheckInObj(
          checkIn,
          wellnessMoods,
          wellnessSymptoms,
          wellnessFactors,
          checkInHealthMeasurement
        );

      formattedCheckIns.push(formattedCheckIn);
    }
    return {
      count: formattedCheckIns.length,
      checkIns: formattedCheckIns,
    };
  }

  async getWellnessCheckIn(
    getWellnessCheckInParams: TGetMyWellnessCheckInParams
  ): Promise<TGetWellnessCheckInVo> {
    const { checkInId } = getWellnessCheckInParams;

    const checkIn = (await this.checkInRepository.findCheckInById(
      checkInId
    )) as TSelectableCheckInWithSleepTimeString;

    if (!checkIn) {
      throw new CustomHttpException(`${checkInId} does not exist`, HttpErrorCode.NOT_FOUND);
    }
    const [wellnessMoods, wellnessSymptoms, wellnessFactors, checkInHealthMeasurement] =
      await Promise.all([
        await this.checkInWellnessMoodRepository.findWellnessMoodsByCheckInId(checkInId),
        await this.checkInWellnessSymptomRepository.findWellnessSymptomsByCheckInId(checkInId),
        await this.checkInWellnessFactorRepository.findWellnessFactorsByCheckInId(checkInId),
        await this.checkInHealthMeasurementRepository.findCheckInMeasurementByCheckInId(checkInId),
      ]);

    const formattedWellnessMoods = wellnessMoods.map((wellnessMood) =>
      this.wellnessCheckInFormatter.formatWellnessMood(wellnessMood)
    );
    const formattedWellnessSymptoms = wellnessSymptoms.map((wellnessSymptom) =>
      this.wellnessCheckInFormatter.formatWellnessSymptom(wellnessSymptom)
    );
    const formattedWellnessFactors = wellnessFactors.map((wellnessFactor) =>
      this.wellnessCheckInFormatter.formatWellnessFactor(wellnessFactor)
    );
    const formattedCheckInHealthMeasurement = checkInHealthMeasurement
      ? this.wellnessCheckInFormatter.formatCheckInHealthMeasurement(checkInHealthMeasurement)
      : undefined;

    return this.wellnessCheckInFormatter.formatCheckInObj(
      checkIn,
      formattedWellnessMoods,
      formattedWellnessSymptoms,
      formattedWellnessFactors,
      formattedCheckInHealthMeasurement
    );
  }

  async getWellnessMoodsSummary(
    getWellnessMoodsSummaryQueryParams: TGetWellnessMoodsSummaryQueryParams
  ): Promise<TGetWellnessMoodsSummaryVo> {
    let { days } = getWellnessMoodsSummaryQueryParams;

    if (!days) {
      days = WELLNESS_MOODS_SUMMARY_DEFAULT_DAYS;
    }

    const userId = this.clsService.get('user.id');

    const now = new Date();
    const [from, to] = getDatesInInterval(now, days, 'day');

    const wellnessMoodsSummary = await this.checkInWellnessMoodRepository.getWellnessMoodsSummary(
      userId,
      { from: from.toDate(), to: to.toDate() }
    );

    return {
      count: wellnessMoodsSummary.length,
      wellnessMoods: wellnessMoodsSummary,
    };
  }

  async getWellnessSymptomsSummary(
    getWellnessSymptomsSummaryQueryParams: TGetWellnessSymptomsSummaryQueryParams
  ): Promise<TGetWellnessSymptomsSummaryVo> {
    let { days } = getWellnessSymptomsSummaryQueryParams;

    if (!days) {
      days = WELLNESS_SYMPTOMS_SUMMARY_DEFAULT_DAYS;
    }

    const userId = this.clsService.get('user.id');

    const now = new Date();
    const [from, to] = getDatesInInterval(now, days, 'day');

    const wellnessSymptomsSummary =
      await this.checkInWellnessSymptomRepository.getWellnessSymptomsSummary(userId, {
        from: from.toDate(),
        to: to.toDate(),
      });

    return {
      count: wellnessSymptomsSummary.length,
      wellnessSymptoms: wellnessSymptomsSummary,
    };
  }
}
