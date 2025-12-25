import z from 'zod';

import { TApiMethod } from '../types';

export const GET_WELLNESS_MOODS_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_MOODS_URL = '/sys/wellness-moods';

export const getWellnessMoodsVoSchema = z.array(
  z.object({
    wellnessMoodId: z.string().nonempty(),
    wellnessMoodName: z.string().nonempty(),
    wellnessMoodPosition: z.string().nonempty(),
  })
);

export type TGetWellnessMoodsVo = z.infer<typeof getWellnessMoodsVoSchema>;
