import { IdPrefix } from '@peernest/core';
import z from 'zod';

export const userIdSchema = z.string().startsWith(IdPrefix.User);
export const pronounIdSchema = z.string().startsWith(IdPrefix.Pronoun);
export const universityIdSchema = z.string().startsWith(IdPrefix.University);
export const domainIdSchema = z.string().startsWith(IdPrefix.Domain);
export const interestIdSchema = z.string().startsWith(IdPrefix.Interest);
export const personalGoalIdSchema = z.string().startsWith(IdPrefix.PersonalGoal);
