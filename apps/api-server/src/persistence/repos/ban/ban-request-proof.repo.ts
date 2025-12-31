import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableBanRequestProof,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class BanRequestProofRepository {
  private static repoName = 'BAN_REQUEST_PROOF_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createBanRequestProofs(
    banRequestProofObjs: TInsertableBanRequestProof[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const banRequestProofs = await db
        .insertInto('banRequestProof')
        .values(banRequestProofObjs)
        .returningAll()
        .execute();

      return banRequestProofs!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanRequestProofRepository.repoName}] | Fail to create ban request proofs`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banRequestProofObjs }
      );
    }
  }
}
