import { Injectable } from '@nestjs/common';
import { TCreateWellnessCheckInRo, TCreateWellnessCheckInVo } from '@peernest/contract';
import {
  generateCheckInHealthMeasurementId,
  generateCheckInId,
  generateCheckInWellnessFactorId,
  generateCheckInWellnessMoodId,
  generateCheckInWellnessSymptomId,
  getStartOfDay,
  HttpErrorCode,
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
      startDate: getStartOfDay(now),
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
}
