import z from 'zod';

export const GET_PERSONAL_GOALS = '/sys/personal-goals';

export const getPersonalGoalsVoSchema = z.array(
  z.object({
    personalGoalId: z.string(),
    personalGoalTitle: z.string(),
    personalGoalName: z.string(),
    personalGoalDescription: z.string().nullable(),
    personalGoalPosition: z.string(),
  })
);

export type TGetPersonalGoalsVo = z.infer<typeof getPersonalGoalsVoSchema>;
