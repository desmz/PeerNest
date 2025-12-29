import z from 'zod';

import { TApiMethod } from '../types';

export const GET_DOMAINS_METHOD: TApiMethod = 'get';

export const GET_DOMAINS_URL = '/sys/domains';

export const domainSchema = z.object({
  domainId: z.string(),
  domainName: z.string(),
});

export const getDomainsVoSchema = z.array(domainSchema);

export type TGetDomainsVo = z.infer<typeof getDomainsVoSchema>;
