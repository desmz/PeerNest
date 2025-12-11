import z from 'zod';

export const GET_DOMAINS = '/sys/domains';

export const getDomainsVoSchema = z.array(
  z.object({
    domainId: z.string(),
    domainName: z.string(),
  })
);

export type TGetDomainsVo = z.infer<typeof getDomainsVoSchema>;
