import z from 'zod';

import { TApiMethod } from '../types';

export const GET_WELLNESS_SYMPTOMS_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_SYMPTOMS_URL = '/sys/wellness-symptoms';

export const wellnessSymptomSchema = z.object({
  wellnessSymptomId: z.string().nonempty(),
  wellnessSymptomName: z.string().nonempty(),
  wellnessSymptomPosition: z.string().nonempty(),
});

export type TWellnessSymptom = z.infer<typeof wellnessSymptomSchema>;

export const getWellnessSymptomsVoSchema = z.array(
  z.object({
    wellnessSymptomCategoryId: z.string().nonempty(),
    wellnessSymptomCategoryName: z.string().nonempty(),
    wellnessSymptomCategoryPosition: z.string().nonempty(),
    wellnessSymptoms: z.array(wellnessSymptomSchema),
  })
);

export type TGetWellnessSymptomsVo = z.infer<typeof getWellnessSymptomsVoSchema>;
