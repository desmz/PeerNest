import { Insertable, Selectable, Updateable } from 'kysely';

import {
  Account,
  Attachment,
  Interest,
  PersonalGoal,
  Pronoun,
  Role,
  University,
  User,
  UserInfo,
  UserInfoInterest,
  UserInfoPersonalGoal,
  Domain,
  UserToken,
  FriendRequest,
  Relationship,
  Conversation,
  ConversationParticipant,
  Discussion,
  DiscussionAttachment,
  DiscussionPersonalGoal,
  DiscussionInterest,
  UserDiscussionReport,
  Comment,
  UserCommentReport,
  UserDiscussionLike,
  UserCommentLike,
  WellnessMood,
  WellnessSymptomCategory,
  WellnessSymptom,
  WellnessFactorCategory,
  WellnessFactor,
  CheckIn,
  CheckInWellnessMood,
  CheckInWellnessFactor,
  CheckInHealthMeasurement,
  CheckInWellnessSymptom,
} from './db';

// role
export type TSelectableRole = Selectable<Role>;
export type TInsertableRole = Insertable<Role>;
export type TUpdatableRole = Updateable<Omit<Role, 'id'>>;

// user
export type TSelectableUser = Selectable<User>;
export type TInsertableUser = Insertable<User>;
export type TUpdatableUser = Updateable<Omit<User, 'id'>>;

// account
export type TSelectableAccount = Selectable<Account>;
export type TInsertableAccount = Insertable<Account>;
export type TUpdatableAccount = Updateable<Omit<Account, 'id'>>;

// attachment
export type TSelectableAttachment = Selectable<Attachment>;
export type TInsertableAttachment = Insertable<Attachment>;
export type TUpdatableAttachment = Updateable<Omit<Attachment, 'id'>>;

// user_token
export type TSelectableUserToken = Selectable<UserToken>;
export type TInsertableUserToken = Insertable<UserToken>;
export type TUpdatableUserToken = Updateable<Omit<UserToken, 'id'>>;

// pronoun
export type TSelectablePronoun = Selectable<Pronoun>;
export type TInsertablePronoun = Insertable<Pronoun>;
export type TUpdatablePronoun = Updateable<Omit<Pronoun, 'id'>>;

// university
export type TSelectableUniversity = Selectable<University>;
export type TInsertableUniversity = Insertable<University>;
export type TUpdatableUniversity = Updateable<Omit<University, 'id'>>;

// domain
export type TSelectableDomain = Selectable<Domain>;
export type TInsertableDomain = Insertable<Domain>;
export type TUpdatableDomain = Updateable<Omit<Domain, 'id'>>;

// user_info
export type TSelectableUserInfo = Selectable<UserInfo>;
export type TInsertableUserInfo = Insertable<UserInfo>;
export type TUpdatableUserInfo = Updateable<Omit<UserInfo, 'id'>>;

// interest
export type TSelectableInterest = Selectable<Interest>;
export type TInsertableInterest = Insertable<Interest>;
export type TUpdatableInterest = Updateable<Omit<Interest, 'id'>>;

// personal_goal
export type TSelectablePersonalGoal = Selectable<PersonalGoal>;
export type TInsertablePersonalGoal = Insertable<PersonalGoal>;
export type TUpdatablePersonalGoal = Updateable<Omit<PersonalGoal, 'id'>>;

// user_info_interest
export type TSelectableUserInfoInterest = Selectable<UserInfoInterest>;
export type TInsertableUserInfoInterest = Insertable<UserInfoInterest>;
export type TUpdatableUserInfoInterest = Updateable<Omit<UserInfoInterest, 'id'>>;

// user_info_personal_goal
export type TSelectableUserInfoPersonalGoal = Selectable<UserInfoPersonalGoal>;
export type TInsertableUserInfoPersonalGoal = Insertable<UserInfoPersonalGoal>;
export type TUpdatableUserInfoPersonalGoal = Updateable<Omit<UserInfoPersonalGoal, 'id'>>;

// friend_request
export type TSelectableFriendRequest = Selectable<FriendRequest>;
export type TInsertableFriendRequest = Insertable<FriendRequest>;
export type TUpdatableFriendRequest = Updateable<Omit<FriendRequest, 'id'>>;

// relationship
export type TSelectableRelationship = Selectable<Relationship>;
export type TInsertableRelationship = Insertable<Relationship>;
export type TUpdatableRelationship = Updateable<Omit<Relationship, 'id'>>;

// conversation
export type TSelectableConversation = Selectable<Conversation>;
export type TInsertableConversation = Insertable<Conversation>;
export type TUpdatableConversation = Updateable<Omit<Conversation, 'id'>>;

// conversation_participant
export type TSelectableConversationParticipant = Selectable<ConversationParticipant>;
export type TInsertableConversationParticipant = Insertable<ConversationParticipant>;
export type TUpdatableConversationParticipant = Updateable<Omit<ConversationParticipant, 'id'>>;

// discussion
export type TSelectableDiscussion = Selectable<Discussion>;
export type TInsertableDiscussion = Insertable<Discussion>;
export type TUpdatableDiscussion = Updateable<Omit<Discussion, 'id'>>;

// discussion_attachment
export type TSelectableDiscussionAttachment = Selectable<DiscussionAttachment>;
export type TInsertableDiscussionAttachment = Insertable<DiscussionAttachment>;
export type TUpdatableDiscussionAttachment = Updateable<Omit<DiscussionAttachment, 'id'>>;

// discussion_personal_goal
export type TSelectableDiscussionPersonalGoal = Selectable<DiscussionPersonalGoal>;
export type TInsertableDiscussionPersonalGoal = Insertable<DiscussionPersonalGoal>;
export type TUpdatableDiscussionPersonalGoal = Updateable<Omit<DiscussionPersonalGoal, 'id'>>;

// discussion_interest
export type TSelectableDiscussionInterest = Selectable<DiscussionInterest>;
export type TInsertableDiscussionInterest = Insertable<DiscussionInterest>;
export type TUpdatableDiscussionInterest = Updateable<Omit<DiscussionInterest, 'id'>>;

// user_discussion_report
export type TSelectableUserDiscussionReport = Selectable<UserDiscussionReport>;
export type TInsertableUserDiscussionReport = Insertable<UserDiscussionReport>;
export type TUpdatableUserDiscussionReport = Updateable<Omit<UserDiscussionReport, 'id'>>;

// comment
export type TSelectableComment = Selectable<Comment>;
export type TInsertableComment = Insertable<Comment>;
export type TUpdatableComment = Updateable<Omit<Comment, 'id'>>;

// user_comment_report
export type TSelectableUserCommentReport = Selectable<UserCommentReport>;
export type TInsertableUserCommentReport = Insertable<UserCommentReport>;
export type TUpdatableUserCommentReport = Updateable<Omit<UserCommentReport, 'id'>>;

// user_discussion_like
export type TSelectableUserDiscussionLike = Selectable<UserDiscussionLike>;
export type TInsertableUserDiscussionLike = Insertable<UserDiscussionLike>;
export type TUpdatableUserDiscussionLike = Updateable<Omit<UserDiscussionLike, 'id'>>;

// user_comment_like
export type TSelectableUserCommentLike = Selectable<UserCommentLike>;
export type TInsertableUserCommentLike = Insertable<UserCommentLike>;
export type TUpdatableUserCommentLike = Updateable<Omit<UserCommentLike, 'id'>>;

// wellness_mood
export type TSelectableWellnessMood = Selectable<WellnessMood>;
export type TInsertableWellnessMood = Insertable<WellnessMood>;
export type TUpdatableWellnessMood = Updateable<Omit<WellnessMood, 'id'>>;

// wellness_symptom_category
export type TSelectableWellnessSymptomCategory = Selectable<WellnessSymptomCategory>;
export type TInsertableWellnessSymptomCategory = Insertable<WellnessSymptomCategory>;
export type TUpdatableWellnessSymptomCategory = Updateable<Omit<WellnessSymptomCategory, 'id'>>;

// wellness_symptom
export type TSelectableWellnessSymptom = Selectable<WellnessSymptom>;
export type TInsertableWellnessSymptom = Insertable<WellnessSymptom>;
export type TUpdatableWellnessSymptom = Updateable<Omit<WellnessSymptom, 'id'>>;

// wellness_factor_category
export type TSelectableWellnessFactorCategory = Selectable<WellnessFactorCategory>;
export type TInsertableWellnessFactorCategory = Insertable<WellnessFactorCategory>;
export type TUpdatableWellnessFactorCategory = Updateable<Omit<WellnessFactorCategory, 'id'>>;

// wellness_factor
export type TSelectableWellnessFactor = Selectable<WellnessFactor>;
export type TInsertableWellnessFactor = Insertable<WellnessFactor>;
export type TUpdatableWellnessFactor = Updateable<Omit<WellnessFactor, 'id'>>;

// check_in
export type TSelectableCheckIn = Selectable<CheckIn>;
export type TInsertableCheckIn = Insertable<CheckIn>;
export type TUpdatableCheckIn = Updateable<Omit<CheckIn, 'id'>>;

// check_in_wellness_mood
export type TSelectableCheckInWellnessMood = Selectable<CheckInWellnessMood>;
export type TInsertableCheckInWellnessMood = Insertable<CheckInWellnessMood>;
export type TUpdatableCheckInWellnessMood = Updateable<Omit<CheckInWellnessMood, 'id'>>;

// check_in_wellness_symptom
export type TSelectableCheckInWellnessSymptom = Selectable<CheckInWellnessSymptom>;
export type TInsertableCheckInWellnessSymptom = Insertable<CheckInWellnessSymptom>;
export type TUpdatableCheckInWellnessSymptom = Updateable<Omit<CheckInWellnessSymptom, 'id'>>;

// check_in_wellness_factor
export type TSelectableCheckInWellnessFactor = Selectable<CheckInWellnessFactor>;
export type TInsertableCheckInWellnessFactor = Insertable<CheckInWellnessFactor>;
export type TUpdatableCheckInWellnessFactor = Updateable<Omit<CheckInWellnessFactor, 'id'>>;

// check_in_health_measurement
export type TSelectableCheckInHealthMeasurement = Selectable<CheckInHealthMeasurement>;
export type TInsertableCheckInHealthMeasurement = Insertable<CheckInHealthMeasurement>;
export type TUpdatableCheckInHealthMeasurement = Updateable<Omit<CheckInHealthMeasurement, 'id'>>;
