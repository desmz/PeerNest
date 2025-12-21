import { Module, Provider } from '@nestjs/common';

import { AttachmentRepository } from './repos/attachment/attachment.repo';
import { ConversationParticipantRepository } from './repos/conversation/conversation-participant.repo';
import { ConversationRepository } from './repos/conversation/conversation.repo';
import { DiscussionAttachmentRepository } from './repos/discussion/discussion-attachment.repo';
import { DiscussionInterestRepository } from './repos/discussion/discussion-interest.repo';
import { DiscussionPersonalGoalRepository } from './repos/discussion/discussion-personal-goal.repo';
import { DiscussionRepository } from './repos/discussion/discussion.repo';
import { UserDiscussionLikeRepository } from './repos/discussion/user-discussion-like.repo';
import { FriendRequestRepository } from './repos/friendship/friend-request.repo';
import { RelationshipRepository } from './repos/friendship/relationship.repo';
import { DomainRepository } from './repos/system/domain.repo';
import { InterestRepository } from './repos/system/interest.repo';
import { PersonalGoalRepository } from './repos/system/personal-goal.repo';
import { PronounRepository } from './repos/system/pronoun.repo';
import { UniversityRepository } from './repos/system/university.repo';
import { AccountRepository } from './repos/user/account.repo';
import { RoleRepository } from './repos/user/role.repo';
import { UserInfoInterestRepository } from './repos/user/user-info-interest.repo';
import { UserInfoPersonalGoalRepository } from './repos/user/user-info-personal-goal.repo';
import { UserInfoRepository } from './repos/user/user-info.repo';
import { UserTokenRepository } from './repos/user/user-token.repo';
import { UserRepository } from './repos/user/user.repo';

const repositories: Provider[] = [
  AttachmentRepository,
  ConversationRepository,
  ConversationParticipantRepository,
  FriendRequestRepository,
  RelationshipRepository,
  DomainRepository,
  InterestRepository,
  PersonalGoalRepository,
  PronounRepository,
  UniversityRepository,
  AccountRepository,
  RoleRepository,
  UserInfoRepository,
  UserInfoInterestRepository,
  UserInfoPersonalGoalRepository,
  UserTokenRepository,
  UserRepository,
  DiscussionRepository,
  DiscussionAttachmentRepository,
  DiscussionPersonalGoalRepository,
  DiscussionInterestRepository,
  UserDiscussionLikeRepository,
];

@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class PersistenceModule {}
