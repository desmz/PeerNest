import { TApiMethod } from 'src/types';
import z from 'zod';

export const GET_WELLNESS_MOODS_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_MOODS_URL = '/wellness/moods';

export const getWellnessMoodsVoSchema = z.array(
  z.object({
    wellnessMoodId: z.string().nonempty(),
    wellnessMoodName: z.string().nonempty(),
    wellnessMoodPosition: z.string().nonempty(),
  })
);

export type TGetWellnessMoodsVo = z.infer<typeof getWellnessMoodsVoSchema>;
