import z from 'zod';

export const GET_UNIVERSITIES = '/sys/universities';

export const universitySchema = z.object({
  universityId: z.string(),
  universityName: z.string(),
  universityCountry: z.string(),
});

export const getUniversityVoSchema = z.array(universitySchema);

export type TGetUniversityVo = z.infer<typeof getUniversityVoSchema>;
