import { MAX_BIO_LEN, MAX_LOOKING_FOR_LEN, MIN_BIO_LEN, MIN_LOOKING_FOR_LEN } from '@peernest/core';
import z from 'zod';

import { displayNameSchema } from '../auth';
import {
  domainIdSchema,
  interestIdSchema,
  personalGoalIdSchema,
  pronounIdSchema,
  universityIdSchema,
  zMax,
  zMin,
  zNonEmptyObject,
  zString,
} from '../utils';

import { getMeProfileVoSchema } from './get-me-profile';

export const UPDATE_ME_PROFILE = '/me/profile';

export const updateMeProfileFields = {
  userDisplayName: 'Display name',
  userInfoPronounId: 'Pronoun Id',
  userInfoUniversityId: 'University Id',
  userInfoDomainId: 'Domain Id',
  userInfoBio: 'About or Bio',
  userInfoLookingFor: 'Looking For field',
  interestIds: 'Interest Ids',
  personalIds: 'Personal Goal Ids',
} as const;

export const userInfoBioSchema = z
  .string(zString(updateMeProfileFields.userInfoBio))
  .min(MIN_BIO_LEN, zMin(updateMeProfileFields.userInfoBio, MIN_BIO_LEN))
  .max(MAX_BIO_LEN, zMax(updateMeProfileFields.userInfoBio, MAX_BIO_LEN));

export const userInfoLookingForSchema = z
  .string(zString(updateMeProfileFields.userInfoLookingFor))
  .min(MIN_LOOKING_FOR_LEN, zMin(updateMeProfileFields.userInfoLookingFor, MIN_LOOKING_FOR_LEN))
  .max(MAX_LOOKING_FOR_LEN, zMax(updateMeProfileFields.userInfoLookingFor, MAX_LOOKING_FOR_LEN));

export const updateMeProfileRoSchema = zNonEmptyObject(
  z.object({
    userDisplayName: displayNameSchema,
    userInfoPronounId: pronounIdSchema.nullable(),
    userInfoUniversityId: universityIdSchema.nullable(),
    userInfoDomainId: domainIdSchema.nullable(),
    userInfoBio: userInfoBioSchema.nullable(),
    userInfoLookingFor: userInfoLookingForSchema.nullable(),
    interestIds: z.array(interestIdSchema).nullable(),
    personalGoalIds: z.array(personalGoalIdSchema).nullable(),
  })
);

export type TUpdateMeProfileRo = z.infer<typeof updateMeProfileRoSchema>;

export type TUpdateMeProfileVo = z.infer<typeof getMeProfileVoSchema>;
