import z from 'zod';

export const GET_INTERESTS_URL = '/sys/interests';

export const getInterestsVoSchema = z.array(
  z.object({
    interestId: z.string(),
    interestName: z.string(),
    interestPosition: z.string(),
  })
);

export type TGetInterestsVo = z.infer<typeof getInterestsVoSchema>;
