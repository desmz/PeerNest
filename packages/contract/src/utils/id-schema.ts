import { IdPrefix } from '@peernest/core';
import z from 'zod';

import { zStartWith, zString } from './schema';

export const roleIdSchema = (field = 'Role Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.Role, zStartWith(field, IdPrefix.Role));
};

export const userIdSchema = (field = 'User Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.User, zStartWith(field, IdPrefix.User));
};

export const attachmentIdSchema = (field = 'Attachment Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.Attachment, zStartWith(field, IdPrefix.Attachment));
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

export const friendRequestIdSchema = (field = 'Friend Request Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.FriendRequest, zStartWith(field, IdPrefix.FriendRequest));
};

export const discussionIdSchema = (field = 'Discussion Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.Discussion, zStartWith(field, IdPrefix.Discussion));
};

export const commentIdSchema = (field = 'Comment Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.Comment, zStartWith(field, IdPrefix.Comment));
};

export const wellnessMoodIdSchema = (field = 'Wellness Mood Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.WellnessMood, zStartWith(field, IdPrefix.WellnessMood));
};

export const wellnessSymptomIdSchema = (field = 'Wellness Symptom Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.WellnessSymptom, zStartWith(field, IdPrefix.WellnessSymptom));
};

export const wellnessSymptomCategoryIdSchema = (field = 'Wellness Symptom Category Id') => {
  return z
    .string(zString(field))
    .startsWith(
      IdPrefix.WellnessSymptomCategory,
      zStartWith(field, IdPrefix.WellnessSymptomCategory)
    );
};

export const wellnessFactorIdSchema = (field = 'Wellness Factor Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.WellnessFactor, zStartWith(field, IdPrefix.WellnessFactor));
};

export const wellnessFactorCategoryIdSchema = (field = 'Wellness Factor Category Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.WellnessFactorCategory, zStartWith(field, IdPrefix.WellnessFactor));
};

export const checkIdSchema = (field = 'Check In Id') => {
  return z.string(zString(field)).startsWith(IdPrefix.CheckIn, zStartWith(field, IdPrefix.CheckIn));
};

export const checkInHealthMeasurementIdSchema = (field = 'Check In Health Measurement Id') => {
  return z
    .string(zString(field))
    .startsWith(
      IdPrefix.CheckInHealthMeasurement,
      zStartWith(field, IdPrefix.CheckInHealthMeasurement)
    );
};

export const banRequestIdSchema = (field = 'Ban Request Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.BanRequest, zStartWith(field, IdPrefix.BanRequest));
};

export const banActionIdSchema = (field = 'Ban Action Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.BanAction, zStartWith(field, IdPrefix.BanAction));
};

export const roleApplicationIdSchema = (field = 'Role Application Id') => {
  return z
    .string(zString(field))
    .startsWith(IdPrefix.RoleApplication, zStartWith(field, IdPrefix.RoleApplication));
};
