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
  FriendRequest = 'frq',
  Relationship = 'rlts',
  Conversation = 'cvst',
  ConversationParticipant = 'cvstptcp',
  Discussion = 'dcs',
  DiscussionAttachment = 'dcsatm',
  DiscussionPersonalGoal = 'dcspsng',
  DiscussionInterest = 'dcsitr',
  UserDiscussionReport = 'usrdcsrp',
  Comment = 'cm',
  UserCommentReport = 'usrcmrp',
  UserDiscussionLike = 'usrdcsl',
  UserCommentLike = 'usrcml',
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

export function generateFriendRequestId() {
  return IdPrefix.FriendRequest + '-' + generateUuid();
}

export function generateRelationshipId() {
  return IdPrefix.Relationship + '-' + generateUuid();
}

export function generateConversationId() {
  return IdPrefix.Conversation + '-' + generateUuid();
}

export function generateConversationParticipantId() {
  return IdPrefix.ConversationParticipant + '-' + generateUuid();
}

export function generateDiscussionId() {
  return IdPrefix.Discussion + '-' + generateUuid();
}

export function generateDiscussionAttachmentId() {
  return IdPrefix.DiscussionAttachment + '-' + generateUuid();
}

export function generateDiscussionPersonalGoalId() {
  return IdPrefix.DiscussionPersonalGoal + '-' + generateUuid();
}

export function generateDiscussionInterestId() {
  return IdPrefix.DiscussionInterest + '-' + generateUuid();
}

export function generateUserDiscussionReportId() {
  return IdPrefix.UserDiscussionReport + '-' + generateUuid();
}

export function generateCommentId() {
  return IdPrefix.Comment + '-' + generateUuid();
}

export function generateUserCommentReportId() {
  return IdPrefix.UserCommentReport + '-' + generateUuid();
}

export function generateUserDiscussionLikeId() {
  return IdPrefix.UserDiscussionLike + '-' + generateUuid();
}

export function generateUserCommentLikeId() {
  return IdPrefix.UserCommentLike + '-' + generateUuid();
}
