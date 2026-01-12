import z from 'zod';

import { TApiMethod } from '../types';
import { interestIdSchema, zNonEmptyString } from '../utils';

import { interestSchema } from './get-interests';

export const UPDATE_INTEREST_METHOD: TApiMethod = 'put';

export const UPDATE_INTEREST_URL = '/sys/interests/{interestId}';

export const updateInterestParamsSchema = z.object({
  interestId: interestIdSchema(),
});

export type TUpdateInterestParams = z.infer<typeof updateInterestParamsSchema>;

export const updateInterestFields = {
  interestName: 'Interest Name',
} as const;

export const updateInterestRoSchema = z.object({
  interestName: zNonEmptyString(updateInterestFields.interestName),
});

export type TUpdateInterestRo = z.infer<typeof updateInterestRoSchema>;

export const updateInterestVoSchema = interestSchema;

export type TUpdateInterestVo = z.infer<typeof updateInterestVoSchema>;
