import z from 'zod';

export const GET_DOMAINS = '/sys/domains';

export const domainSchema = z.object({
  domainId: z.string(),
  domainName: z.string(),
});

export const getDomainsVoSchema = z.array(domainSchema);

export type TGetDomainsVo = z.infer<typeof getDomainsVoSchema>;
