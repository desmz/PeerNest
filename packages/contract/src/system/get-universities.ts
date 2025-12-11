import z from 'zod';

export const GET_UNIVERSITIES = '/system/universities';

export const getUniversityVoSchema = z.array(
  z.object({
    universityId: z.string(),
    universityName: z.string(),
    universityCountry: z.string(),
  })
);

export type TGetUniversityVo = z.infer<typeof getUniversityVoSchema>;
