import z from 'zod';

import { TApiMethod } from '../types';

export const GET_INTERESTS_METHOD: TApiMethod = 'get';

export const GET_INTERESTS_URL = '/sys/interests';

export const interestSchema = z.object({
  interestId: z.string(),
  interestName: z.string(),
  interestPosition: z.string(),
});

export const getInterestsVoSchema = z.array(interestSchema);

export type TGetInterestsVo = z.infer<typeof getInterestsVoSchema>;
