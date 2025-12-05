import { envObj } from '@peernest/config';

import { TKyselyTransaction, TKyselyDB } from './types/kysely.type';

export function chooseSchema(db: TKyselyDB, schema?: string) {
  if (schema && schema.length > 0) {
    return db.withSchema(schema);
  }

  const nodeEnv = envObj.NODE_ENV;
  switch (nodeEnv) {
    case 'development':
      return db.withSchema('dev');
    case 'test':
      return db.withSchema('test');
    case 'production':
      return db.withSchema('prod');
    default:
      throw Error(`Invalid node environment ${nodeEnv}`);
  }
}

/*
 * Executes a transaction or a callback using the provided database instance.
 * If an existing transaction is provided, it directly executes the callback with it.
 * Otherwise, it starts a new transaction using the provided database instance and executes the callback within that transaction.
 */
export async function executeTx<T>(
  db: TKyselyDB,
  callback: (trx: TKyselyTransaction) => Promise<T>,
  existingTrx?: TKyselyTransaction
): Promise<T> {
  if (existingTrx) {
    return await callback(existingTrx); // Execute callback with existing transaction
  } else {
    return await db.transaction().execute((trx) => callback(trx)); // Start new transaction and execute callback
  }
}

/*
 * This function returns either an existing transaction if provided,
 * or the normal database instance.
 */
export function dbOrTx(
  db: TKyselyDB,
  existingTrx?: TKyselyTransaction
): TKyselyDB | TKyselyTransaction {
  if (existingTrx) {
    return existingTrx; // Use existing transaction
  } else {
    return db; // Use normal database instance
  }
}
