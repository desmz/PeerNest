import z from 'zod';

import {
  getWellnessMoodsVoSchema,
  wellnessFactorCategorySchema,
  wellnessFactorSchema,
  wellnessSymptomCategorySchema,
  wellnessSymptomSchema,
} from '../system';
import { TApiMethod } from '../types';
import { checkIdSchema } from '../utils';

export const GET_WELLNESS_CHECK_IN_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_CHECK_IN_URL = '/wellness/check-ins/{checkInId}';

export const getWellnessCheckInParamsSchema = z.object({
  checkInId: checkIdSchema(),
});

export type TGetMyWellnessCheckInParams = z.infer<typeof getWellnessCheckInParamsSchema>;

export const checkInHealthMeasurementSchema = z.object({
  hearRate: z.int().positive().nullable(),
  stepCount: z.int().positive().nullable(),
  weight: z.number().nullable(),
});

export type TCheckInHealthMeasurement = z.infer<typeof checkInHealthMeasurementSchema>;

export const getWellnessCheckInVoSchema = z.object({
  checkInId: checkIdSchema(),
  checkInCheckInTime: z.date(),
  checkInMoodRating: z.int().positive(),
  checkInSleepQualityRating: z.int().positive().nullable(),
  checkInSleepTime: z.string().nullable(),
  wellnessMoods: getWellnessMoodsVoSchema.nullable(),
  wellnessSymptoms: z
    .array(
      wellnessSymptomSchema.extend({
        wellnessSymptomCategory: wellnessSymptomCategorySchema,
      })
    )
    .nullable(),
  wellnessFactors: z
    .array(
      wellnessFactorSchema.extend({
        wellnessFactorCategory: wellnessFactorCategorySchema,
      })
    )
    .nullable(),
  checkInHealthMeasurement: checkInHealthMeasurementSchema.nullable(),
});

export type TGetWellnessCheckInVo = z.infer<typeof getWellnessCheckInVoSchema>;
