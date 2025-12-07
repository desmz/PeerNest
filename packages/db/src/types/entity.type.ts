import { Insertable, Selectable, Updateable } from 'kysely';

import { Account, Attachment, Role, User, UserToken } from './db';

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
