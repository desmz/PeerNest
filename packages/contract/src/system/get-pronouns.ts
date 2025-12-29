import z from 'zod';

import { TApiMethod } from '../types';

export const GET_PRONOUNS_METHOD: TApiMethod = 'get';
export const GET_PRONOUNS_URL = '/sys/pronouns';

export const pronounSchema = z.object({
  pronounId: z.string(),
  pronounName: z.string(),
});

export const getPronounsVoSchema = z.array(pronounSchema);

export type TGetPronounsVo = z.infer<typeof getPronounsVoSchema>;
