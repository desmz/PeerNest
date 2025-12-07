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
