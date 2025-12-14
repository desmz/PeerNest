import z from 'zod';

export const GET_PRONOUNS = '/sys/pronouns';

export const pronounSchema = z.object({
  pronounId: z.string(),
  pronounName: z.string(),
});

export const getPronounsVoSchema = z.array(pronounSchema);

export type TGetPronounsVo = z.infer<typeof getPronounsVoSchema>;
