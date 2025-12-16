import { DB } from '@peernest/db/types/db';
import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';

export function withPronoun(baseEb: ExpressionBuilder<DB, 'userInfo'>) {
  const eb = baseEb
    .selectFrom('pronoun')
    .select(['pronoun.pronounId', 'pronoun.pronounName'])
    .whereRef('pronoun.pronounId', '=', 'userInfo.userInfoPronounId');

  return jsonObjectFrom(eb).as('pronoun');
}

export function withUniversity(baseEb: ExpressionBuilder<DB, 'userInfo'>) {
  const eb = baseEb
    .selectFrom('university')
    .select([
      'university.universityId',
      'university.universityName',
      'university.universityCountry',
    ])
    .whereRef('university.universityId', '=', 'userInfo.userInfoUniversityId');

  return jsonObjectFrom(eb).as('university');
}

export function withDomain(baseEb: ExpressionBuilder<DB, 'userInfo'>) {
  const eb = baseEb
    .selectFrom('domain')
    .select(['domain.domainId', 'domain.domainName'])
    .whereRef('domain.domainId', '=', 'userInfo.userInfoDomainId');

  return jsonObjectFrom(eb).as('domain');
}

export function withInterests(baseEb: ExpressionBuilder<DB, 'userInfo'>) {
  const eb = baseEb
    .selectFrom('userInfoInterest')
    .innerJoin('interest', 'interest.interestId', 'userInfoInterest.userInfoInterestInterestId')
    .select([
      'interest.interestId',
      'interest.interestName',
      'userInfoInterest.userInfoInterestPosition as interestPosition',
    ])
    .whereRef('userInfo.userInfoId', '=', 'userInfoInterest.userInfoInterestUserInfoId')
    .orderBy('userInfoInterestPosition', 'asc');

  return jsonArrayFrom(eb).as('interests');
}

export function withPersonalGoals(baseEb: ExpressionBuilder<DB, 'userInfo'>) {
  const eb = baseEb
    .selectFrom('userInfoPersonalGoal')
    .innerJoin(
      'personalGoal',
      'personalGoal.personalGoalId',
      'userInfoPersonalGoal.userInfoPersonalGoalPersonalGoalId'
    )
    .select([
      'personalGoal.personalGoalId',
      'personalGoal.personalGoalTitle',
      'personalGoal.personalGoalName',
      'personalGoal.personalGoalDescription',
      'userInfoPersonalGoal.userInfoPersonalGoalPosition as personalGoalPosition',
    ])
    .whereRef('userInfo.userInfoId', '=', 'userInfoPersonalGoal.userInfoPersonalGoalUserInfoId')
    .orderBy('userInfoPersonalGoalPosition', 'asc');

  return jsonArrayFrom(eb).as('personalGoals');
}
