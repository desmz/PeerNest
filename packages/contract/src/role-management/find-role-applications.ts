import { FindRoleApplicationsNames } from '@peernest/core';
import z from 'zod';

import { roleSchema } from '../system';
import { TApiMethod } from '../types';
import { findUserBaseSchema } from '../user';
import { zPosInt } from '../utils';

export const FIND_ROLE_APPLICATIONS_METHOD: TApiMethod = 'get';

export const FIND_ROLE_APPLICATIONS_URL = 'roles/applications';

export const findRoleApplicationsQueryParamFields = {
  roleIds: 'Role Ids Query Param',
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
};

export const findRoleApplicationsQueryParamsSchema = z.object({
  roles: z.array(z.enum(FindRoleApplicationsNames)).nullish(),
  limit: zPosInt(findRoleApplicationsQueryParamFields.limit).nullish(),
  offset: zPosInt(findRoleApplicationsQueryParamFields.offset).nullish(),
});

export type TFindRoleApplicationsQueryParams = z.infer<
  typeof findRoleApplicationsQueryParamsSchema
>;

export const roleApplicationSchema = z.object({
  roleApplicationId: z.string().nonempty(),
  roleApplicationStatus: z.string().nonempty(),
  roleApplicationDescription: z.string().nonempty().nullable(),
  roleApplicationCreatedTime: z.date(),
  roleApplicationAppliedRole: roleSchema,
  roleApplicant: findUserBaseSchema,
  attachments: z.array(z.string().nonempty()),
});

export type TRoleApplication = z.infer<typeof roleApplicationSchema>;

export const findRoleApplicationsVoSchema = z.object({
  count: z.int().positive(),
  roleApplications: z.array(roleApplicationSchema),
});

export type TFindRoleApplicationsVo = z.infer<typeof findRoleApplicationsVoSchema>;
