# PeerNest Main Components Documentation

## Table of Contents

1. [Overview](#overview)
2. [Backend API Server Components](#backend-api-server-components)
3. [Shared Packages](#shared-packages)
4. [Frontend Components](#frontend-components)
5. [Data Access Layer Components](#data-access-layer-components)
6. [Component-Subsystem Mapping](#component-subsystem-mapping)
7. [Component Interactions](#component-interactions)

---

## Overview

The PeerNest system is composed of multiple layers of components, each with specific responsibilities. Components are organized into:

- **Backend Modules**: NestJS feature modules in the API server
- **Shared Libraries**: Reusable packages across the application
- **Frontend Modules**: React feature modules in the web application
- **Data Access Objects**: Repository pattern implementations
- **Supporting Infrastructure**: Guards, interceptors, filters, pipes

---

## Backend API Server Components

### Architecture Pattern

All backend feature modules follow a consistent structure:

```
Module (entry point)
├── Controller (HTTP endpoints)
├── Service (business logic)
├── DTO (data validation)
├── Guards (authorization)
├── Interceptors (request/response processing)
├── Strategies (authentication)
└── Types (type definitions)
```

### Feature Modules Table

| Module Name                | Location                    | Controller                   | Service(s)                | Primary Responsibility                         |
| -------------------------- | --------------------------- | ---------------------------- | ------------------------- | ---------------------------------------------- |
| **User Module**            | `features/user/`            | UserController, MeController | UserService, MeService    | User account management and profile operations |
| **Auth Module**            | `features/auth/`            | AuthController               | AuthService, TokenService | Authentication, JWT tokens, OAuth strategies   |
| **Discussion Module**      | `features/discussion/`      | DiscussionController         | DiscussionService         | Create, read, manage discussions               |
| **Comment Module**         | `features/comment/`         | CommentController            | CommentService            | Comment creation, replies, moderation          |
| **Friendship Module**      | `features/friendship/`      | FriendshipController         | FriendshipService         | Friend requests, connections, relationships    |
| **Attachment Module**      | `features/attachment/`      | AttachmentController         | AttachmentService         | File uploads, storage, retrieval               |
| **Wellness Module**        | `features/wellness/`        | WellnessController           | WellnessService           | Wellness tracking, check-ins, metrics          |
| **Counselor Module**       | `features/counselor/`       | CounselorController          | CounselorService          | Counselor management, assignments              |
| **Mail Sender Module**     | `features/mail-sender/`     | (internal)                   | MailSenderService         | Email sending, notifications                   |
| **Moderation Module**      | `features/moderation/`      | ModerationController         | ModerationService         | Content flagging, banning, reports             |
| **Role Management Module** | `features/role-management/` | RoleManagementController     | RoleManagementService     | Roles, permissions, access control             |
| **System Module**          | `features/system/`          | SystemController             | SystemService             | System config, reference data, health checks   |

---

## User Module Details

### Component Diagram

```
UserModule
├── Controllers
│   ├── UserController
│   │   ├── GET /users/:id (get user profile)
│   │   ├── PATCH /users/:id (update profile)
│   │   └── GET /users (list users)
│   └── MeController
│       ├── GET /me (get current user)
│       ├── PATCH /me (update current user)
│       └── POST /me/avatar (upload avatar)
├── Services
│   ├── UserService
│   │   ├── getUserById()
│   │   ├── updateUser()
│   │   ├── listUsers()
│   │   └── deleteUser()
│   └── MeService
│       ├── getCurrentUser()
│       ├── updateCurrentUser()
│       └── uploadAvatar()
├── Dependencies
│   ├── PersistenceModule (repositories)
│   └── StorageModule (file handling)
└── Exports
    └── UserService, MeService (for use by other modules)
```

### Repositories (User)

- `UserRepository` - User account operations
- `UserInfoRepository` - User profile information
- `UserInfoInterestRepository` - User interests
- `UserInfoPersonalGoalRepository` - User personal goals
- `UserTokenRepository` - Authentication tokens
- `AccountRepository` - Account data

---

## Auth Module Details

### Component Diagram

```
AuthModule
├── Controllers
│   └── AuthController
│       ├── POST /auth/login (email/password)
│       ├── POST /auth/signup (register)
│       ├── POST /auth/google (OAuth)
│       ├── POST /auth/refresh (refresh token)
│       └── POST /auth/logout (logout)
├── Services
│   ├── AuthService
│   │   ├── login()
│   │   ├── signup()
│   │   ├── validateUser()
│   │   └── logout()
│   └── TokenService
│       ├── generateToken()
│       ├── validateToken()
│       ├── refreshToken()
│       └── revokeToken()
├── Strategies
│   ├── JwtStrategy
│   │   └── validate() - JWT validation
│   └── GoogleStrategy
│       └── validate() - OAuth2 validation
├── Guards
│   ├── JwtAuthGuard
│   │   └── canActivate() - Request authentication
│   └── RolesGuard
│       └── canActivate() - Role authorization
├── Decorators
│   ├── @CurrentUser() - Extract user from request
│   ├── @Roles() - Define required roles
│   └── @Public() - Skip authentication
├── Dependencies
│   ├── PassportModule (authentication)
│   ├── TokenModule
│   ├── StorageModule
│   └── PersistenceModule
└── Exports
    └── (used as global guard)
```

### Key Features

- JWT-based authentication
- Google OAuth integration
- Token refresh mechanism
- Session management
- Password encryption

---

## Discussion Module Details

### Component Diagram

```
DiscussionModule
├── Controllers
│   └── DiscussionController
│       ├── POST /discussions (create)
│       ├── GET /discussions (list)
│       ├── GET /discussions/:id (get)
│       ├── PATCH /discussions/:id (update)
│       ├── DELETE /discussions/:id (delete)
│       ├── POST /discussions/:id/like (like)
│       └── POST /discussions/:id/report (report)
├── Services
│   └── DiscussionService
│       ├── createDiscussion()
│       ├── getDiscussions()
│       ├── getDiscussionById()
│       ├── updateDiscussion()
│       ├── deleteDiscussion()
│       ├── likeDiscussion()
│       └── reportDiscussion()
├── Repositories
│   ├── DiscussionRepository
│   ├── DiscussionAttachmentRepository
│   ├── DiscussionInterestRepository
│   ├── DiscussionPersonalGoalRepository
│   ├── UserDiscussionLikeRepository
│   └── UserDiscussionReportRepository
├── Dependencies
│   ├── PersistenceModule
│   ├── StorageModule
│   ├── CommentModule (for comments)
│   └── UserModule (for user info)
└── Exports
    └── DiscussionService
```

### Related Entities

- Discussions
- Discussion Attachments
- Discussion Interests & Goals
- Discussion Likes
- Discussion Reports

---

## Comment Module Details

### Component Diagram

```
CommentModule
├── Controllers
│   └── CommentController
│       ├── POST /discussions/:id/comments (create)
│       ├── GET /discussions/:id/comments (list)
│       ├── PATCH /comments/:id (update)
│       ├── DELETE /comments/:id (delete)
│       ├── POST /comments/:id/like (like)
│       └── POST /comments/:id/report (report)
├── Services
│   └── CommentService
│       ├── createComment()
│       ├── getComments()
│       ├── updateComment()
│       ├── deleteComment()
│       ├── likeComment()
│       └── reportComment()
├── Repositories
│   ├── CommentRepository
│   ├── UserCommentLikeRepository
│   └── UserCommentReportRepository
├── Dependencies
│   ├── PersistenceModule
│   └── DiscussionModule
└── Exports
    └── CommentService
```

---

## Friendship Module Details

### Component Diagram

```
FriendshipModule
├── Controllers
│   └── FriendshipController
│       ├── POST /friendships/requests (send request)
│       ├── GET /friendships/requests (list requests)
│       ├── POST /friendships/requests/:id/accept (accept)
│       ├── POST /friendships/requests/:id/reject (reject)
│       ├── GET /friendships (list friends)
│       └── DELETE /friendships/:id (remove friend)
├── Services
│   └── FriendshipService
│       ├── sendFriendRequest()
│       ├── getFriendRequests()
│       ├── acceptRequest()
│       ├── rejectRequest()
│       ├── listFriends()
│       └── removeFriend()
├── Repositories
│   ├── FriendRequestRepository
│   └── RelationshipRepository
├── Dependencies
│   ├── PersistenceModule
│   ├── UserModule
│   └── MailSenderModule (for notifications)
└── Exports
    └── FriendshipService
```

---

## Attachment Module Details

### Component Diagram

```
AttachmentModule
├── Controllers
│   └── AttachmentController
│       ├── POST /attachments (upload)
│       ├── GET /attachments/:id (download)
│       ├── DELETE /attachments/:id (delete)
│       └── GET /attachments/presigned-url (generate URL)
├── Services
│   └── AttachmentService
│       ├── uploadFile()
│       ├── downloadFile()
│       ├── deleteFile()
│       ├── generatePresignedUrl()
│       └── validateFile()
├── Plugins
│   └── StorageModule
│       ├── Local storage adapter
│       ├── S3/Cloud storage adapter
│       └── Presigned URL generation
├── Repositories
│   └── AttachmentRepository
├── Dependencies
│   └── PersistenceModule
└── Exports
    ├── AttachmentService
    └── StorageModule
```

### Supported File Types

- Images (JPEG, PNG, WebP)
- Documents (PDF, DOCX)
- Videos (MP4, WebM)
- Audio (MP3, WAV)

---

## Wellness Module Details

### Component Diagram

```
WellnessModule
├── Controllers
│   └── WellnessController
│       ├── POST /wellness/check-ins (create check-in)
│       ├── GET /wellness/check-ins (list)
│       ├── GET /wellness/check-ins/:id (get)
│       ├── GET /wellness/moods (list mood data)
│       ├── GET /wellness/symptoms (list symptoms)
│       ├── GET /wellness/factors (list factors)
│       └── GET /wellness/metrics (calculate metrics)
├── Services
│   └── WellnessService
│       ├── createCheckIn()
│       ├── getCheckIns()
│       ├── getWellnessMetrics()
│       ├── analyzeMoodTrends()
│       └── generateWellnessReports()
├── Repositories
│   ├── CheckInRepository
│   ├── CheckInWellnessMoodRepository
│   ├── CheckInWellnessSymptomRepository
│   ├── CheckInWellnessFactorRepository
│   ├── CheckInHealthMeasurementRepository
│   ├── WellnessMoodRepository
│   ├── WellnessSymptomRepository
│   ├── WellnessSymptomCategoryRepository
│   ├── WellnessFactorRepository
│   └── WellnessFactorCategoryRepository
├── Dependencies
│   ├── PersistenceModule
│   └── UserModule
└── Exports
    └── WellnessService
```

### Key Features

- Mood tracking
- Symptom tracking
- Health measurements
- Wellness factor analysis
- Trend analysis

---

## Counselor Module Details

### Component Diagram

```
CounselorModule
├── Controllers
│   └── CounselorController
│       ├── GET /counselors (list)
│       ├── GET /counselors/:id (get)
│       ├── POST /counselors/:id/assign (assign)
│       ├── GET /counselors/:id/schedule (schedule)
│       └── POST /counselor-assignments (manage)
├── Services
│   └── CounselorService
│       ├── listCounselors()
│       ├── getCounselorById()
│       ├── assignCounselor()
│       ├── getCounselorSchedule()
│       └── manageAssignments()
├── Repositories
│   └── CounselorUserRepository
├── Dependencies
│   ├── PersistenceModule
│   ├── UserModule
│   └── MailSenderModule
└── Exports
    └── CounselorService
```

---

## Mail Sender Module Details

### Component Diagram

```
MailSenderModule
├── Services
│   └── MailSenderService
│       ├── sendEmail()
│       ├── sendWelcomeEmail()
│       ├── sendPasswordResetEmail()
│       ├── sendNotificationEmail()
│       ├── sendReportEmail()
│       └── queueEmail()
├── Templates (from Transactional Package)
│   ├── WelcomeEmail
│   ├── PasswordResetEmail
│   ├── NotificationEmail
│   ├── ReportEmail
│   └── Custom templates
├── Configuration
│   ├── SMTP settings
│   ├── From address
│   ├── Retry policy
│   └── Rate limiting
├── Dependencies
│   ├── ConfigModule
│   ├── TransactionalPackage
│   └── PersistenceModule
└── Exports
    └── MailSenderService (global module)
```

---

## Moderation Module Details

### Component Diagram

```
ModerationModule
├── Controllers
│   └── ModerationController
│       ├── GET /moderation/reports (list)
│       ├── POST /moderation/reports (create)
│       ├── PATCH /moderation/reports/:id (update status)
│       ├── POST /moderation/bans (ban user)
│       ├── GET /moderation/bans (list bans)
│       └── POST /moderation/bans/:id/appeal (appeal)
├── Services
│   └── ModerationService
│       ├── reportContent()
│       ├── getReports()
│       ├── reviewReport()
│       ├── banUser()
│       ├── listBans()
│       └── handleBanAppeal()
├── Repositories
│   ├── UserDiscussionReportRepository
│   ├── UserCommentReportRepository
│   ├── BanRequestRepository
│   ├── BanActionRepository
│   └── BanRequestProofRepository
├── Dependencies
│   ├── PersistenceModule
│   ├── UserModule
│   ├── MailSenderModule
│   ├── DiscussionModule
│   └── CommentModule
└── Exports
    └── ModerationService
```

### Ban Management

- User bans
- Content bans
- Appeal process
- Ban action tracking

---

## Role Management Module Details

### Component Diagram

```
RoleManagementModule
├── Controllers
│   └── RoleManagementController
│       ├── GET /roles (list)
│       ├── POST /roles (create)
│       ├── GET /roles/:id (get)
│       ├── POST /role-applications (apply)
│       ├── GET /role-applications (list)
│       └── PATCH /role-applications/:id (review)
├── Services
│   └── RoleManagementService
│       ├── listRoles()
│       ├── createRole()
│       ├── applyForRole()
│       ├── reviewApplication()
│       ├── assignRole()
│       └── revokeRole()
├── Repositories
│   ├── RoleRepository
│   ├── RoleApplicationRepository
│   ├── RoleAttachmentRepository
│   └── RoleChangeActionRepository
├── Dependencies
│   ├── PersistenceModule
│   ├── UserModule
│   └── AttachmentModule
└── Exports
    └── RoleManagementService
```

### Role Types

- Administrator
- Moderator
- Counselor
- User (default)
- Premium User

---

## System Module Details

### Component Diagram

```
SystemModule
├── Controllers
│   └── SystemController
│       ├── GET /system/health (health check)
│       ├── GET /system/config (system config)
│       ├── GET /system/interests (reference data)
│       ├── GET /system/goals (reference data)
│       ├── GET /system/domains (reference data)
│       └── GET /system/universities (reference data)
├── Services
│   └── SystemService
│       ├── getHealth()
│       ├── getConfig()
│       ├── getInterests()
│       ├── getPersonalGoals()
│       └── getDomains()
├── Repositories
│   ├── InterestRepository
│   ├── PersonalGoalRepository
│   ├── DomainRepository
│   ├── UniversityRepository
│   ├── PronounRepository
│   └── WellnessFactorCategoryRepository
├── Dependencies
│   └── PersistenceModule
└── Exports
    └── SystemService
```

### Reference Data

- Interests (hobby categories)
- Personal Goals
- Domains (study areas)
- Universities
- Pronouns
- Wellness categories

---

## Shared Packages

### Packages Overview Table

| Package Name      | Location                  | Purpose                                   | Key Exports                                  |
| ----------------- | ------------------------- | ----------------------------------------- | -------------------------------------------- |
| **Config**        | `packages/config/`        | Environment and application configuration | ConfigModule, ENV, validateConfig()          |
| **Core**          | `packages/core/`          | Shared utilities and constants            | Constants, HTTP utilities, Helper functions  |
| **DB**            | `packages/db/`            | Database layer abstraction                | KyselyModule, DB migrations, Services        |
| **Contract**      | `packages/contract/`      | API contracts and types                   | DTO types, API response types, Domain models |
| **Transactional** | `packages/transactional/` | Email templates and rendering             | Email components, Template system            |

---

## Config Package Details

### Structure

```
config/
├── src/
│   ├── index.ts
│   ├── dynamic/
│   │   ├── env.ts (runtime validation)
│   │   ├── index.ts
│   │   └── validation.ts
│   ├── static/
│   │   ├── env.ts (static values)
│   │   ├── index.ts
│   │   ├── validation.ts
│   │   └── vite-env.d.ts
│   └── [package.json, tsconfig.json, ...]
```

### Key Features

- Environment variable validation
- Static and dynamic config
- Type-safe configuration
- Runtime validation using Zod

---

## Core Package Details

### Exports Structure

```
core/
├── constants/
│   ├── attachment.constant.ts
│   ├── auth.constant.ts
│   ├── ban.constant.ts
│   ├── comment.constant.ts
│   ├── counselor.constant.ts
│   ├── discussion.constant.ts
│   ├── friendship.constant.ts
│   ├── moderation.constant.ts
│   ├── role-management.constant.ts
│   ├── system.constant.ts
│   ├── user.constant.ts
│   └── wellness.constant.ts
├── http/
│   ├── HTTP utilities
│   ├── Request helpers
│   └── Response formatters
├── utils/
│   ├── Helper functions
│   ├── Validation utilities
│   ├── Data transformers
│   └── String utilities
└── index.ts (main export)
```

---

## DB Package Details

### Structure

```
db/
├── src/
│   ├── index.ts
│   ├── config.ts (database config)
│   ├── kysely.module.ts (NestJS module)
│   ├── kysely.service.ts (ORM service)
│   ├── migrate.ts (migration tool)
│   └── [migrations, types, ...]
├── docs/
│   └── eraserio_erd_diagram_text.txt
├── scripts/
│   └── run-seed.sh
└── [configuration files]
```

### Key Components

- Kysely configuration
- Database migrations
- Database seeding
- ORM initialization
- Type generation from schema

---

## Contract Package Details

### Type Definitions Structure

```
contract/
├── src/
│   ├── index.ts
│   ├── types.ts (common types)
│   ├── attachment/
│   │   └── [DTO types]
│   ├── auth/
│   │   └── [Auth request/response types]
│   ├── comment/
│   │   └── [Comment DTOs]
│   ├── counselor/
│   │   └── [Counselor types]
│   ├── discussion/
│   │   └── [Discussion DTOs]
│   ├── friendship/
│   │   └── [Friendship types]
│   ├── moderation/
│   │   └── [Moderation types]
│   ├── role-management/
│   │   └── [Role types]
│   ├── system/
│   │   └── [System reference types]
│   ├── user/
│   │   └── [User DTOs]
│   ├── utils/
│   │   └── [Utility types]
│   └── wellness/
│       └── [Wellness DTOs]
```

### Purpose

- Shared TypeScript interfaces
- API request/response contracts
- Data validation schemas
- Domain model definitions

---

## Transactional Package Details

### Structure

```
transactional/
├── src/
│   ├── index.ts
│   ├── emails/
│   │   ├── index.ts
│   │   ├── render.tsx (React email rendering)
│   │   ├── styles.ts (email styles)
│   │   ├── components/
│   │   │   └── [email components]
│   │   ├── layouts/
│   │   │   └── [email layouts]
│   │   ├── pages/
│   │   │   ├── WelcomeEmail.tsx
│   │   │   ├── PasswordResetEmail.tsx
│   │   │   ├── NotificationEmail.tsx
│   │   │   └── [other templates]
│   │   └── static/
│   │       └── [assets, images]
│   └── types/
│       ├── index.ts
│       └── emails.ts (email DTOs)
```

### Email Components

- React-based templates
- Responsive design
- Reusable components
- Static asset support

---

## Frontend Components

### Web Application Structure

```
web/
├── src/
│   ├── main.tsx (entry point)
│   ├── App.tsx (root component)
│   ├── theme.ts (styling config)
│   ├── global.d.ts (type definitions)
│   ├── components/
│   │   ├── [UI components]
│   │   ├── Layout components
│   │   └── Shared components
│   ├── features/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── discussion/
│   │   ├── comment/
│   │   ├── friendship/
│   │   ├── wellness/
│   │   ├── counselor/
│   │   └── [other features]
│   ├── lib/
│   │   ├── API client
│   │   ├── Hooks
│   │   ├── Utils
│   │   └── Store
│   └── assets/
│       └── [images, icons, fonts]
├── vite.config.mts (build config)
├── tsconfig.json (TypeScript config)
└── [package.json, index.html, ...]
```

### Feature Modules (Frontend)

Similar to backend, each feature has:

- Pages/Screens
- Components
- Hooks
- Utilities
- Types
- Styling

---

## Data Access Layer Components

### Repository Pattern

All repositories follow a consistent interface:

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```

### All Repositories

| Domain              | Repositories                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**            | UserRepository, UserInfoRepository, UserInfoInterestRepository, UserInfoPersonalGoalRepository, UserTokenRepository, AccountRepository                                                                                                                                                                    |
| **Discussion**      | DiscussionRepository, DiscussionAttachmentRepository, DiscussionInterestRepository, DiscussionPersonalGoalRepository, UserDiscussionLikeRepository, UserDiscussionReportRepository                                                                                                                        |
| **Comment**         | CommentRepository, UserCommentLikeRepository, UserCommentReportRepository                                                                                                                                                                                                                                 |
| **Friendship**      | FriendRequestRepository, RelationshipRepository                                                                                                                                                                                                                                                           |
| **Attachment**      | AttachmentRepository                                                                                                                                                                                                                                                                                      |
| **Wellness**        | CheckInRepository, CheckInWellnessMoodRepository, CheckInWellnessSymptomRepository, CheckInWellnessFactorRepository, CheckInHealthMeasurementRepository, WellnessMoodRepository, WellnessSymptomRepository, WellnessSymptomCategoryRepository, WellnessFactorRepository, WellnessFactorCategoryRepository |
| **Counselor**       | CounselorUserRepository                                                                                                                                                                                                                                                                                   |
| **Moderation**      | BanActionRepository, BanRequestRepository, BanRequestProofRepository                                                                                                                                                                                                                                      |
| **Role Management** | RoleRepository, RoleApplicationRepository, RoleAttachmentRepository, RoleChangeActionRepository                                                                                                                                                                                                           |
| **System**          | DomainRepository, InterestRepository, PersonalGoalRepository, PronounRepository, UniversityRepository, ConversationRepository, ConversationParticipantRepository                                                                                                                                          |

---

## Component-Subsystem Mapping

### Comprehensive Mapping Table

| Component                      | Type        | Subsystem                      | Team                    |
| ------------------------------ | ----------- | ------------------------------ | ----------------------- |
| **AuthModule**                 | Module      | Authentication & Authorization | Backend Auth Team       |
| **AuthService**                | Service     | Authentication & Authorization | Backend Auth Team       |
| **AuthController**             | Controller  | Authentication & Authorization | Backend Auth Team       |
| **JwtStrategy**                | Strategy    | Authentication & Authorization | Backend Auth Team       |
| **GoogleStrategy**             | Strategy    | Authentication & Authorization | Backend Auth Team       |
| **TokenService**               | Service     | Authentication & Authorization | Backend Auth Team       |
| **JwtAuthGuard**               | Guard       | Authentication & Authorization | Backend Auth Team       |
| **RolesGuard**                 | Guard       | Authentication & Authorization | Backend Auth Team       |
| **RoleManagementModule**       | Module      | Authentication & Authorization | Backend Auth Team       |
| **RoleManagementService**      | Service     | Authentication & Authorization | Backend Auth Team       |
| **RoleManagementController**   | Controller  | Authentication & Authorization | Backend Auth Team       |
|                                |             |                                |                         |
| **UserModule**                 | Module      | User Management                | Backend User Services   |
| **UserService**                | Service     | User Management                | Backend User Services   |
| **MeService**                  | Service     | User Management                | Backend User Services   |
| **UserController**             | Controller  | User Management                | Backend User Services   |
| **MeController**               | Controller  | User Management                | Backend User Services   |
| **AttachmentModule**           | Module      | User Management                | Backend User Services   |
| **AttachmentService**          | Service     | User Management                | Backend User Services   |
| **StorageModule**              | Module      | User Management                | Backend User Services   |
|                                |             |                                |                         |
| **DiscussionModule**           | Module      | Social & Community             | Community Features Team |
| **DiscussionService**          | Service     | Social & Community             | Community Features Team |
| **DiscussionController**       | Controller  | Social & Community             | Community Features Team |
| **CommentModule**              | Module      | Social & Community             | Community Features Team |
| **CommentService**             | Service     | Social & Community             | Community Features Team |
| **CommentController**          | Controller  | Social & Community             | Community Features Team |
| **FriendshipModule**           | Module      | Social & Community             | Community Features Team |
| **FriendshipService**          | Service     | Social & Community             | Community Features Team |
| **FriendshipController**       | Controller  | Social & Community             | Community Features Team |
| **ModerationModule**           | Module      | Social & Community             | Community Features Team |
| **ModerationService**          | Service     | Social & Community             | Community Features Team |
| **ModerationController**       | Controller  | Social & Community             | Community Features Team |
|                                |             |                                |                         |
| **WellnessModule**             | Module      | Wellness & Counseling          | Wellness Team           |
| **WellnessService**            | Service     | Wellness & Counseling          | Wellness Team           |
| **WellnessController**         | Controller  | Wellness & Counseling          | Wellness Team           |
| **CounselorModule**            | Module      | Wellness & Counseling          | Wellness Team           |
| **CounselorService**           | Service     | Wellness & Counseling          | Wellness Team           |
| **CounselorController**        | Controller  | Wellness & Counseling          | Wellness Team           |
|                                |             |                                |                         |
| **MailSenderModule**           | Module      | Notification & Email           | Infrastructure Team     |
| **MailSenderService**          | Service     | Notification & Email           | Infrastructure Team     |
|                                |             |                                |                         |
| **SystemModule**               | Module      | System Management              | Infrastructure Team     |
| **SystemService**              | Service     | System Management              | Infrastructure Team     |
| **SystemController**           | Controller  | System Management              | Infrastructure Team     |
| **ConfigModule**               | Module      | System Management              | Infrastructure Team     |
|                                |             |                                |                         |
| **PersistenceModule**          | Module      | Data Access                    | All Teams               |
| **[All Repositories]**         | Repository  | Data Access                    | All Teams               |
|                                |             |                                |                         |
| **ConfigPackage**              | Package     | System Management              | Infrastructure Team     |
| **CorePackage**                | Package     | Shared                         | All Teams               |
| **DBPackage**                  | Package     | Data Access                    | Infrastructure Team     |
| **ContractPackage**            | Package     | Shared                         | All Teams               |
| **TransactionalPackage**       | Package     | Notification & Email           | Infrastructure Team     |
|                                |             |                                |                         |
| **Web App**                    | Application | Frontend UI                    | Frontend Team           |
| **Feature Modules (Frontend)** | Modules     | Frontend UI                    | Frontend Team           |
| **Components**                 | Components  | Frontend UI                    | Frontend Team           |

---

## Component Interactions

### Core Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                      Auth Service                            │
│         (Gateway to all protected resources)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────────┐
        │            │            │                  │
        ▼            ▼            ▼                  ▼
   ┌────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐
   │ User   │  │Discussion│  │Friendship  │  │Wellness      │
   │Service │  │Service   │  │Service     │  │Service       │
   └────┬───┘  └────┬─────┘  └────────────┘  └──────────────┘
        │           │
        └─────┬─────┘
              │
        ┌─────▼──────────────┐
        │Comment Service     │
        │Moderation Service  │
        │Counselor Service   │
        │Attachment Service  │
        └────────────────────┘
              │
              ▼
    ┌──────────────────────┐
    │  Mail Sender Service │
    │  (notifications)     │
    └──────────────────────┘
              │
              ▼
    ┌──────────────────────┐
    │ Persistence Module   │
    │ (Repositories)       │
    └──────────────────────┘
              │
              ▼
    ┌──────────────────────┐
    │  PostgreSQL DB       │
    └──────────────────────┘
```

### Frontend-Backend Integration

```
┌──────────────────────────┐
│   React Web Application  │
│   (Frontend)             │
└──────────────┬───────────┘
               │ HTTP/REST
               ▼
┌──────────────────────────┐
│   API Server             │
│   (NestJS)               │
├──────────────────────────┤
│  11 Feature Modules      │
│  (Services & Controllers)│
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────┐
│   PostgreSQL Database    │
└──────────────────────────┘
```

### Cross-Module Communication Pattern

```
ModuleA (Controller)
    ↓
ModuleA (Service)
    ↓ (injects)
ModuleB (Service) [via exports]
    ↓
Shared Repository
    ↓
Kysely Query Builder
    ↓
PostgreSQL
```

---

## Technology Stack Summary

### Backend Components

- **Language**: TypeScript 5.9
- **Framework**: NestJS 11
- **ORM**: Kysely
- **Validation**: Zod
- **Authentication**: Passport.js, JWT
- **Database**: PostgreSQL
- **Module System**: NestJS modules

### Frontend Components

- **Language**: TypeScript 5.9
- **Framework**: React 19
- **Router**: React Router DOM 6.29
- **Styling**: PostCSS
- **Build Tool**: Vite
- **HTTP Client**: Axios

### Shared Infrastructure

- **Package Manager**: pnpm 10.4
- **Monorepo Tool**: Nx 22.1
- **Linting**: ESLint 9
- **Code Formatting**: Prettier 3.4
- **Testing**: Vitest

---

## Component Lifecycle

### Request-Response Lifecycle

```
1. Client Request
   ↓
2. Route Handler (Controller method)
   ↓
3. Validation (Pipes & Guards)
   ↓
4. Authentication (JwtAuthGuard)
   ↓
5. Authorization (RolesGuard)
   ↓
6. Request Interceptor
   ↓
7. Service Method Execution
   ↓
8. Repository Query
   ↓
9. Database Operation
   ↓
10. Response Mapper
    ↓
11. Response Interceptor
    ↓
12. Client Response (JSON)
```

---

## Future Component Expansion

### Planned Components (Future)

- GraphQL API layer
- WebSocket server for real-time features
- Message queue service (RabbitMQ/Kafka)
- Caching layer (Redis)
- Analytics service
- Search service (Elasticsearch)
- File processing service

---

**Document Version**: 1.0  
**Last Updated**: January 6, 2026  
**Maintained By**: Architecture & Development Teams
