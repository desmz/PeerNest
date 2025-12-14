import { Insertable, Selectable, Updateable } from 'kysely';

import {
  Account,
  Attachment,
  Interest,
  PersonalGoal,
  Pronoun,
  Role,
  University,
  User,
  UserInfo,
  UserInfoInterest,
  UserInfoPersonalGoal,
  Domain,
  UserToken,
} from './db';

// role
export type TSelectableRole = Selectable<Role>;
export type TInsertableRole = Insertable<Role>;
export type TUpdatableRole = Updateable<Omit<Role, 'id'>>;

// user
export type TSelectableUser = Selectable<User>;
export type TInsertableUser = Insertable<User>;
export type TUpdatableUser = Updateable<Omit<User, 'id'>>;

// account
export type TSelectableAccount = Selectable<Account>;
export type TInsertableAccount = Insertable<Account>;
export type TUpdatableAccount = Updateable<Omit<Account, 'id'>>;

// attachment
export type TSelectableAttachment = Selectable<Attachment>;
export type TInsertableAttachment = Insertable<Attachment>;
export type TUpdatableAttachment = Updateable<Omit<Attachment, 'id'>>;

// user_token
export type TSelectableUserToken = Selectable<UserToken>;
export type TInsertableUserToken = Insertable<UserToken>;
export type TUpdatableUserToken = Updateable<Omit<UserToken, 'id'>>;

// pronoun
export type TSelectablePronoun = Selectable<Pronoun>;
export type TInsertablePronoun = Insertable<Pronoun>;
export type TUpdatablePronoun = Updateable<Omit<Pronoun, 'id'>>;

// university
export type TSelectableUniversity = Selectable<University>;
export type TInsertableUniversity = Insertable<University>;
export type TUpdatableUniversity = Updateable<Omit<University, 'id'>>;

// domain
export type TSelectableDomain = Selectable<Domain>;
export type TInsertableDomain = Insertable<Domain>;
export type TUpdatableDomain = Updateable<Omit<Domain, 'id'>>;

// user_info
export type TSelectableUserInfo = Selectable<UserInfo>;
export type TInsertableUserInfo = Insertable<UserInfo>;
export type TUpdatableUserInfo = Updateable<Omit<UserInfo, 'id'>>;

// interest
export type TSelectableInterest = Selectable<Interest>;
export type TInsertableInterest = Insertable<Interest>;
export type TUpdatableInterest = Updateable<Omit<Interest, 'id'>>;

// personal_goal
export type TSelectablePersonalGoal = Selectable<PersonalGoal>;
export type TInsertablePersonalGoal = Insertable<PersonalGoal>;
export type TUpdatablePersonalGoal = Updateable<Omit<PersonalGoal, 'id'>>;

// user_info_interest
export type TSelectableUserInfoInterest = Selectable<UserInfoInterest>;
export type TInsertableUserInfoInterest = Insertable<UserInfoInterest>;
export type TUpdatableUserInfoInterest = Updateable<Omit<UserInfoInterest, 'id'>>;

// user_info_personal_goal
export type TSelectableUserInfoPersonalGoal = Selectable<UserInfoPersonalGoal>;
export type TInsertableUserInfoPersonalGoal = Insertable<UserInfoPersonalGoal>;
export type TUpdatableUserInfoPersonalGoal = Updateable<Omit<UserInfoPersonalGoal, 'id'>>;
