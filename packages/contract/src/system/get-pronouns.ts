import z from 'zod';

export const GET_PRONOUNS = '/sys/pronouns';

export const getPronounsVoSchema = z.array(
  z.object({
    pronounId: z.string(),
    pronounName: z.string(),
  })
);

export type TGetPronounsVo = z.infer<typeof getPronounsVoSchema>;
