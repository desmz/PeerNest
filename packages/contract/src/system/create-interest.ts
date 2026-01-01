import z from 'zod';

import { TApiMethod } from '../types';
import { zNonEmptyString } from '../utils';

import { interestSchema } from './get-interests';

export const CREATE_INTEREST_METHOD: TApiMethod = 'post';

export const CREATE_INTEREST_URL = '/sys/interests';

export const createInterestFields = {
  interestName: 'Interest Name',
} as const;

export const createInterestRoSchema = z.object({
  interestName: zNonEmptyString(createInterestFields.interestName),
});

export type TCreateInterestRo = z.infer<typeof createInterestRoSchema>;

export const createInterestVoSchema = interestSchema;

export type TCreateInterestVo = z.infer<typeof createInterestVoSchema>;
