import { IdPrefix } from '@peernest/core';
import z from 'zod';

import { zStartWith, zString } from './schema';

export const userIdSchema = (field = 'User Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.User, zStartWith(field, IdPrefix.User));
};

export const pronounIdSchema = (field = 'Pronoun Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.Pronoun, zStartWith(field, IdPrefix.Pronoun));
};

export const universityIdSchema = (field = 'University Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.University, zStartWith(field, IdPrefix.University));
};

export const domainIdSchema = (field = 'Domain Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.Domain, zStartWith(field, IdPrefix.Domain));
};

export const interestIdSchema = (field = 'Interest Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.Interest, zStartWith(field, IdPrefix.Interest));
};

export const personalGoalIdSchema = (field = 'Personal Goal Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.PersonalGoal, zStartWith(field, IdPrefix.PersonalGoal));
};

export const conversationIdSchema = (field = 'Conversation Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.Conversation, zStartWith(field, IdPrefix.Conversation));
};
