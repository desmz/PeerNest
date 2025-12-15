import { Injectable } from '@nestjs/common';
import {
  generateRelationshipId,
  HttpErrorCode,
  orderIdPair,
  RelationshipType,
} from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableRelationship, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class RelationshipRepository {
  private static repoName = 'RELATIONSHIP_REPO';

  constructor(private readonly kyselyService: KyselyService) {}

  async createRelationship(relationshipObj: TInsertableRelationship, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const [userIdA, userIdB] = orderIdPair(
        relationshipObj.relationshipUserIdA,
        relationshipObj.relationshipUserIdB
      );

      const now = relationshipObj.relationshipCreatedTime
        ? relationshipObj.relationshipCreatedTime
        : new Date();

      const relationship = await db
        .insertInto('relationship')
        .values({
          ...relationshipObj,
          relationshipUserIdA: userIdA,
          relationshipUserIdB: userIdB,
          relationshipId: relationshipObj.relationshipId
            ? relationshipObj.relationshipId
            : generateRelationshipId(),
          relationshipCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return relationship!;
    } catch (error) {
      throw new CustomHttpException(
        `[${RelationshipRepository.repoName}] | Fail to create relationship`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, relationshipObj }
      );
    }
  }

  async findRelationshipByUserIds(
    userIds: {
      userIdA: string;
      userIdB: string;
    },
    options?: {
      relationshipType: RelationshipType;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const [userIdA, userIdB] = orderIdPair(userIds.userIdA, userIds.userIdB);
      const { relationshipType } = options || {};

      let query = db
        .selectFrom('relationship')
        .selectAll()
        .where('relationshipUserIdA', '=', userIdA)
        .where('relationshipUserIdB', '=', userIdB);

      if (relationshipType) {
        query = query.where('relationshipType', '=', relationshipType);
      }

      const relationship = await query.executeTakeFirst();

      return relationship;
    } catch (error) {
      throw new CustomHttpException(
        `[${RelationshipRepository.repoName}] | Fail to find relationship by userIds`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userIds }
      );
    }
  }
}
