import { Kysely, Transaction } from 'kysely';

import { DB } from './db';

export type TKyselyDB = Kysely<DB>;
export type TKyselyTransaction = Transaction<DB>;
