import { Module, Provider } from '@nestjs/common';

import { UserAchievementRepository } from './repos/achievement';
import { AttachmentRepository } from './repos/attachment';
import { BanActionRepository, BanRequestProofRepository, BanRequestRepository } from './repos/ban';
import {
  CommentRepository,
  UserCommentLikeRepository,
  UserCommentReportRepository,
} from './repos/comment';
import { ConversationParticipantRepository, ConversationRepository } from './repos/conversation';
import { CounselorUserRepository } from './repos/counselor';
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
  RoleApplicationRepository,
  RoleAttachmentRepository,
  RoleChangeActionRepository,
} from './repos/role-management';
import {
  AchievementCategoryRepository,
  AchievementRepository,
  DomainRepository,
  InterestRepository,
  PersonalGoalRepository,
  PronounRepository,
  UniversityRepository,
  WellnessFactorCategoryRepository,
  WellnessFactorRepository,
  WellnessMoodRepository,
  WellnessSymptomCategoryRepository,
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
  WellnessSymptomCategoryRepository,
  WellnessFactorCategoryRepository,
  WellnessFactorRepository,
  CheckInRepository,
  CheckInWellnessMoodRepository,
  CheckInWellnessSymptomRepository,
  CheckInWellnessFactorRepository,
  CheckInHealthMeasurementRepository,
  BanActionRepository,
  BanRequestRepository,
  BanRequestProofRepository,
  RoleApplicationRepository,
  RoleAttachmentRepository,
  RoleChangeActionRepository,
  CounselorUserRepository,
  AchievementCategoryRepository,
  AchievementRepository,
  UserAchievementRepository,
];

@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class PersistenceModule {}
