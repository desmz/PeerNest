import { Injectable } from '@nestjs/common';
import {
  TCheckInHealthMeasurement,
  TGetWellnessCheckInVo,
  TWellnessMood,
} from '@peernest/contract';
import { sortStringCompareFn } from '@peernest/core';
import { TSelectableCheckInHealthMeasurement } from '@peernest/db';

import {
  TSelectableCheckInWithSleepTimeString,
  TSelectableWellnessFactorWithCheckInId,
  TSelectableWellnessMoodWithCheckInId,
  TSelectableWellnessSymptomWithCheckInId,
  TWellnessFactorWithCategory,
  TWellnessSymptomWithCategory,
} from './types';

@Injectable()
export class WellnessCheckInFormatter {
  formatWellnessMood(wellnessMood: TSelectableWellnessMoodWithCheckInId): TWellnessMood {
    const { wellnessMoodId, wellnessMoodName, wellnessMoodPosition } = wellnessMood;

    return {
      wellnessMoodId,
      wellnessMoodName,
      wellnessMoodPosition,
    };
  }

  formatWellnessSymptom(
    wellnessSymptom: TSelectableWellnessSymptomWithCheckInId
  ): TWellnessSymptomWithCategory {
    const {
      wellnessSymptomId,
      wellnessSymptomName,
      wellnessSymptomPosition,
      wellnessSymptomCategoryId,
      wellnessSymptomCategoryName,
      wellnessSymptomCategoryPosition,
    } = wellnessSymptom;

    return {
      wellnessSymptomId,
      wellnessSymptomName,
      wellnessSymptomPosition,
      wellnessSymptomCategory: {
        wellnessSymptomCategoryId,
        wellnessSymptomCategoryName,
        wellnessSymptomCategoryPosition,
      },
    };
  }

  formatWellnessFactor(
    wellnessFactor: TSelectableWellnessFactorWithCheckInId
  ): TWellnessFactorWithCategory {
    const {
      wellnessFactorId,
      wellnessFactorName,
      wellnessFactorPosition,
      wellnessFactorCategoryId,
      wellnessFactorCategoryName,
      wellnessFactorCategoryPosition,
    } = wellnessFactor;

    return {
      wellnessFactorId,
      wellnessFactorName,
      wellnessFactorPosition,
      wellnessFactorCategory: {
        wellnessFactorCategoryId,
        wellnessFactorCategoryName,
        wellnessFactorCategoryPosition,
      },
    };
  }

  formatCheckInHealthMeasurement(
    checkInHealthMeasurement: TSelectableCheckInHealthMeasurement
  ): TCheckInHealthMeasurement {
    const {
      checkInHealthMeasurementHeartRate,
      checkInHealthMeasurementStepCount,
      checkInHealthMeasurementWeight,
    } = checkInHealthMeasurement;

    return {
      hearRate: checkInHealthMeasurementHeartRate
        ? parseInt(checkInHealthMeasurementHeartRate)
        : null,
      stepCount: checkInHealthMeasurementStepCount
        ? parseInt(checkInHealthMeasurementStepCount)
        : null,
      weight: checkInHealthMeasurementWeight ? parseFloat(checkInHealthMeasurementWeight) : null,
    };
  }

  formatCheckInObj(
    checkIn: TSelectableCheckInWithSleepTimeString,
    wellnessMoods: TWellnessMood[] | undefined,
    wellnessSymptoms: TWellnessSymptomWithCategory[] | undefined,
    wellnessFactors: TWellnessFactorWithCategory[] | undefined,
    checkInHealthMeasurement: TCheckInHealthMeasurement | undefined
  ): TGetWellnessCheckInVo {
    wellnessMoods?.sort((a, b) =>
      sortStringCompareFn(a.wellnessMoodPosition, b.wellnessMoodPosition)
    );

    wellnessSymptoms?.sort((a, b) => {
      const aPos = a.wellnessSymptomPosition;
      const bPos = b.wellnessSymptomPosition;
      const aCategoryPos = a.wellnessSymptomCategory.wellnessSymptomCategoryPosition;
      const bCategoryPos = b.wellnessSymptomCategory.wellnessSymptomCategoryPosition;

      return aCategoryPos === bCategoryPos
        ? sortStringCompareFn(aPos, bPos)
        : sortStringCompareFn(aCategoryPos, bCategoryPos);
    });

    wellnessFactors?.sort((a, b) => {
      const aPos = a.wellnessFactorPosition;
      const bPos = b.wellnessFactorPosition;
      const aCategoryPos = a.wellnessFactorCategory.wellnessFactorCategoryPosition;
      const bCategoryPos = b.wellnessFactorCategory.wellnessFactorCategoryPosition;

      return aCategoryPos === bCategoryPos
        ? sortStringCompareFn(aPos, bPos)
        : sortStringCompareFn(aCategoryPos, bCategoryPos);
    });

    return {
      checkInId: checkIn.checkInId,
      checkInCheckInTime: checkIn.checkInCheckInTime,
      checkInMoodRating: parseInt(checkIn.checkInMoodRating),
      checkInSleepQualityRating: checkIn.checkInSleepQualityRating
        ? parseInt(checkIn.checkInSleepQualityRating)
        : null,
      checkInSleepTime: checkIn.checkInSleepTime,
      wellnessMoods: wellnessMoods ? wellnessMoods : null,
      wellnessSymptoms: wellnessSymptoms ? wellnessSymptoms : null,
      wellnessFactors: wellnessFactors ? wellnessFactors : null,
      checkInHealthMeasurement: checkInHealthMeasurement || null,
    };
  }
}
