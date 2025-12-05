import { Insertable, Selectable, Updateable } from 'kysely';

import { User } from './db';

// User
export type TSelectableUser = Selectable<User>;
export type TInsertableUser = Insertable<User>;
export type TUpdatableUser = Updateable<Omit<User, 'id'>>;
