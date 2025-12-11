import { customAlphabet } from 'nanoid';
import { uuidv7 } from 'uuidv7';

const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoId = customAlphabet(chars);

export function getRandomString(len: number) {
  return nanoId(len);
}

export enum IdPrefix {
  Role = 'role',
  User = 'usr',
  Account = 'acc',
  Attachment = 'atm',
  UserToken = 'utk',
  Pronoun = 'pn',
  University = 'unvst',
  Domain = 'dm',
  UserInfo = 'usif',
  Interest = 'itr',
  PersonalGoal = 'psng',
  UserInfoInterest = 'usifitr',
  UserInfoPersonalGoal = 'usifpsng',
}

export function generateUuid() {
  return uuidv7();
}

export function generateRoleId() {
  return IdPrefix.Role + '-' + generateUuid();
}

export function generateUserId() {
  return IdPrefix.User + '-' + generateUuid();
}

export function generateAccountId() {
  return IdPrefix.Account + '-' + generateUuid();
}

export function generateAttachmentId() {
  return IdPrefix.Attachment + '-' + generateUuid();
}

export function generateUserTokenId() {
  return IdPrefix.UserToken + '-' + generateUuid();
}

export function generatePronounId() {
  return IdPrefix.Pronoun + '-' + generateUuid();
}

export function generateUniversityId() {
  return IdPrefix.University + '-' + generateUuid();
}

export function generateDomainId() {
  return IdPrefix.Domain + '-' + generateUuid();
}

export function generateUserInfoId() {
  return IdPrefix.UserInfo + '-' + generateUuid();
}

export function generateInterestId() {
  return IdPrefix.Interest + '-' + generateUuid();
}

export function generatePersonalGoalId() {
  return IdPrefix.PersonalGoal + '-' + generateUuid();
}

export function generateUserInfoInterestId() {
  return IdPrefix.UserInfoInterest + '-' + generateUuid();
}

export function generateUserInfoPersonalGoalId() {
  return IdPrefix.UserInfoPersonalGoal + '-' + generateUuid();
}
