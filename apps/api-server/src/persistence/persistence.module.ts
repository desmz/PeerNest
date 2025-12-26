import { Module, Provider } from '@nestjs/common';

import { AttachmentRepository } from './repos/attachment';
import {
  CommentRepository,
  UserCommentLikeRepository,
  UserCommentReportRepository,
} from './repos/comment';
import { ConversationParticipantRepository, ConversationRepository } from './repos/conversation';
import {
  DiscussionAttachmentRepository,
  DiscussionInterestRepository,
  DiscussionPersonalGoalRepository,
  DiscussionRepository,
  UserDiscussionLikeRepository,
  UserDiscussionReportRepository,
} from './repos/discussion';
import { FriendRequestRepository, RelationshipRepository } from './repos/friendship';
import {
  DomainRepository,
  InterestRepository,
  PersonalGoalRepository,
  PronounRepository,
  UniversityRepository,
  WellnessFactorRepository,
  WellnessMoodRepository,
  WellnessSymptomRepository,
} from './repos/system';
import {
  AccountRepository,
  RoleRepository,
  UserInfoInterestRepository,
  UserInfoPersonalGoalRepository,
  UserInfoRepository,
  UserRepository,
  UserTokenRepository,
} from './repos/user';
import {
  CheckInHealthMeasurementRepository,
  CheckInRepository,
  CheckInWellnessFactorRepository,
  CheckInWellnessMoodRepository,
  CheckInWellnessSymptomRepository,
} from './repos/wellness';

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
  UserDiscussionReportRepository,
  CommentRepository,
  UserCommentLikeRepository,
  UserCommentReportRepository,
  WellnessMoodRepository,
  WellnessSymptomRepository,
  WellnessFactorRepository,
  CheckInRepository,
  CheckInWellnessMoodRepository,
  CheckInWellnessSymptomRepository,
  CheckInWellnessFactorRepository,
  CheckInHealthMeasurementRepository,
];

@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class PersistenceModule {}
