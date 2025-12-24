import z from 'zod';

import { TApiMethod } from '../types';

export const GET_UNIVERSITIES_METHOD: TApiMethod = 'get';
export const GET_UNIVERSITIES_URL = '/sys/universities';

export const universitySchema = z.object({
  universityId: z.string(),
  universityName: z.string(),
  universityCountry: z.string(),
});

export const getUniversityVoSchema = z.array(universitySchema);

export type TGetUniversityVo = z.infer<typeof getUniversityVoSchema>;
