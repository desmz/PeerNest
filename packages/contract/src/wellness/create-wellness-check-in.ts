import {
  MAX_CHECK_IN_MOOD_RATING,
  MAX_CHECK_IN_SLEEP_QUALITY_RATING,
  MIN_CHECK_IN_MOOD_RATING,
  MIN_CHECK_IN_SLEEP_QUALITY_RATING,
} from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import {
  checkIdSchema,
  wellnessFactorIdSchema,
  wellnessMoodIdSchema,
  wellnessSymptomIdSchema,
  zDate,
  zIsoDuration,
  zMax,
  zMin,
  zPosInt,
  zPosNumber,
} from '../utils';

export const CREATE_WELLNESS_CHECK_IN_METHOD: TApiMethod = 'post';

export const CREATE_WELLNESS_CHECK_IN_URL = '/wellness/check-ins';

export const createWellnessCheckInFields = {
  checkInCheckInTime: 'Check In Time',
  checkInMoodRating: 'Check In Mood Rating',
  checkInSleepQualityRating: 'Check In Sleep Quality Rating',
  checkInSleepTime: 'Check In Sleep TIme',
  wellnessMoodIds: 'Wellness Mood Ids',
  wellnessSymptomIds: 'Wellness Symptom Ids',
  wellnessFactorIds: 'Wellness Factor Ids',
  checkInHealthMeasurement: {
    _name: 'Check In Health Measurement',
    heartRate: 'Heart Rate',
    stepCount: 'Step Count',
    weight: 'Weight',
  },
} as const;

export const createWellnessCheckInRoSchema = z.object({
  checkInCheckInTime: z.coerce.date(zDate(createWellnessCheckInFields.checkInCheckInTime)),
  checkInMoodRating: zPosInt(createWellnessCheckInFields.checkInMoodRating)
    .min(
      MIN_CHECK_IN_MOOD_RATING,
      zMin(createWellnessCheckInFields.checkInMoodRating, MIN_CHECK_IN_MOOD_RATING, 'values')
    )
    .max(
      MAX_CHECK_IN_MOOD_RATING,
      zMax(createWellnessCheckInFields.checkInMoodRating, MAX_CHECK_IN_MOOD_RATING, 'values')
    ),
  checkInSleepQualityRating: zPosInt(createWellnessCheckInFields.checkInSleepQualityRating)
    .min(
      MIN_CHECK_IN_SLEEP_QUALITY_RATING,
      zMin(
        createWellnessCheckInFields.checkInSleepQualityRating,
        MIN_CHECK_IN_SLEEP_QUALITY_RATING,
        'values'
      )
    )
    .max(
      MAX_CHECK_IN_SLEEP_QUALITY_RATING,
      zMax(
        createWellnessCheckInFields.checkInSleepQualityRating,
        MAX_CHECK_IN_SLEEP_QUALITY_RATING,
        'values'
      )
    )
    .nullable(),
  checkInSleepTime: z.iso
    .duration(zIsoDuration(createWellnessCheckInFields.checkInSleepTime))
    .nullable(),
  wellnessMoodIds: z.array(wellnessMoodIdSchema()).nullable(),
  wellnessSymptomIds: z.array(wellnessSymptomIdSchema()).nullable(),
  wellnessFactorIds: z.array(wellnessFactorIdSchema()).nullable(),
  checkInHealthMeasurement: z
    .object({
      heartRate: zPosInt(createWellnessCheckInFields.checkInHealthMeasurement.heartRate).nullable(),
      stepCount: zPosInt(createWellnessCheckInFields.checkInHealthMeasurement.stepCount).nullable(),
      weight: zPosNumber(createWellnessCheckInFields.checkInHealthMeasurement.weight).nullable(),
    })
    .nullable(),
});

export type TCreateWellnessCheckInRo = z.infer<typeof createWellnessCheckInRoSchema>;

export const createWellnessCheckInVoSchema = z.object({
  checkInId: checkIdSchema(),
  checkInCheckInTime: z.date(),
});

export type TCreateWellnessCheckInVo = z.infer<typeof createWellnessCheckInVoSchema>;
