import { Injectable, Logger as NestLogger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { envObj } from '@peernest/config';
import { CamelCasePlugin, Kysely, LogEvent, PostgresDialect, sql } from 'kysely';
import { Pool, types } from 'pg';
import { format, type FormatOptionsWithLanguage } from 'sql-formatter';

import { TKyselyDB } from './types';
import { DB } from './types/db';
import { chooseSchema } from './utils';

// Fix INT8 → number
types.setTypeParser(types.builtins.INT8, (val) => Number(val));

class KyselyLogger {
  private logger = new NestLogger('SQL');
  private isFormatted: boolean;
  private defaultFormattedOption: FormatOptionsWithLanguage = {
    language: 'postgresql',
    keywordCase: 'upper',
    dataTypeCase: 'upper',
    functionCase: 'upper',
  };

  constructor(isFormatted = true) {
    this.isFormatted = isFormatted;
  }

  logQuery(query: string, params: readonly unknown[]): void {
    if (this.isFormatted) {
      const formattedParams = Object.assign({}, ['0', ...params.map(String)]);

      const formattedStat = format(query, {
        ...this.defaultFormattedOption,
        params: formattedParams,
      });

      this.logger.log(`\n${formattedStat}\n`);
    } else {
      this.logger.log(`${query} | Params: ${JSON.stringify(params)}`);
    }
  }
}

export type TKyselyServiceOptions = { formatted?: boolean };

@Injectable()
export class KyselyService implements OnModuleInit, OnModuleDestroy {
  public db: TKyselyDB;
  private pool: Pool;
  private logger: NestLogger;
  private formattedSqlLogger: KyselyLogger;

  constructor(options?: Partial<TKyselyServiceOptions>) {
    this.pool = new Pool({
      connectionString: envObj.PG_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    }).on('error', (err) => {
      console.error('Database error:', err.message);
    });

    this.formattedSqlLogger = new KyselyLogger(options?.formatted);

    this.db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: this.pool,
      }),
      plugins: [new CamelCasePlugin()],
      log: (event: LogEvent) => {
        if (envObj.NODE_ENV !== 'development') return;

        const { sql, parameters } = event.query;
        this.formattedSqlLogger.logQuery(sql, parameters);
      },
    });

    this.db = chooseSchema(this.db);

    this.logger = new NestLogger(KyselyService.name);
  }

  async onModuleInit() {
    this.logger.log('Initializing database module...');
    await this.retryConnect();
  }

  async onModuleDestroy() {
    this.logger.log('Destroying database connection...');
    await this.db?.destroy();
    await this.pool?.end();
  }

  private async retryConnect() {
    const retryAttempts = 15;
    const retryDelay = 3000;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        await sql`SELECT 1`.execute(this.db);
        this.logger.log('Database connection successful');
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.logger.error(err?.errors?.[0] ?? err);

        if (attempt < retryAttempts) {
          this.logger.warn(`Retrying [${attempt}/${retryAttempts}] in ${retryDelay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          this.logger.error(`Failed to connect after ${retryAttempts} attempts. Exiting...`);
          process.exit(1);
        }
      }
    }
  }
}
