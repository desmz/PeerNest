# PeerNest Software Architecture

## Table of Contents

1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [System Components](#system-components)
4. [Subsystem Description](#subsystem-description)
5. [Team Organization](#team-organization)
6. [Data Flow](#data-flow)
7. [Technology Stack](#technology-stack**)\*\*

---

## Overview

PeerNest is a monorepo-based application built with modern web technologies, following a layered architecture pattern. The system is organized into distinct layers: Presentation, Business Logic, Service, Data Access, and Data layers, with clear separation of concerns.

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                              │
│                   User Function Interface                           │
│            (React Web App + Mobile Clients)                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Business Layer      │          │  Business Layer      │
│                      │          │                      │
│ Community Hub System │          │ Counseling System    │
│ - Discussions        │          │ - Counseling Booking │
│ - Friendships        │          │ - Wellness Tracking  │
│ - Comments           │          │ - Resources          │
└──────────┬───────────┘          └──────────┬───────────┘
           │                                   │
        ┌──┴─────────────────────────────────┬┘
        ▼                                     ▼
┌──────────────────────────────────────────────────────┐
│             Service Layer                             │
│         (NestJS API Services)                         │
├──────────────────────────────────────────────────────┤
│ • User Service          • Discussion Service         │
│ • Auth Service          • Comment Service            │
│ • Attachment Service    • Wellness Service           │
│ • Friendship Service    • Moderation Service         │
│ • Role Management       • Mail Sender Service        │
│ • Counselor Service     • System Service             │
└──────────────────────────┬──────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                       ▼
┌──────────────────────┐          ┌──────────────────────┐
│ Data Access Layer    │          │   Shared Libraries   │
│ (Kysely ORM)         │          │                      │
│                      │          │ • Config Package     │
│ Database queries     │          │ • Core Package       │
│ Data validation      │          │ • DB Package         │
│ Data mapping         │          │ • Contract Package   │
└──────────┬───────────┘          │ • Transactional Pkg  │
           │                      └──────────┬───────────┘
        ┌──┴──────────────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────┐
│             Data Layer                                │
│         PostgreSQL Database                           │
├──────────────────────────────────────────────────────┤
│ • Users              • Attachments    • Roles         │
│ • Discussions        • Comments       • Permissions   │
│ • Wellness Data      • Counseling     • Moderation    │
│ • Relationships      • Messages       • System Config  │
└──────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. **Presentation Layer**

- **Technology**: React 19 with TypeScript, React Router
- **Location**: `/apps/web`
- **Responsibility**:
  - User interface and interactions
  - Form handling and validation
  - State management for client-side logic
  - Responsive design and theming
- **Key Components**:
  - Feature-based modules (features/)
  - Reusable components (components/)
  - Styling and theming (theme.ts)
  - Asset management (assets/)

### 2. **Business Layer**

Organized into two main systems:

#### **Community Hub System**

- Discussion management
- User friendships and social connections
- Comments and interactions
- Community moderation

#### **Counseling System**

- Counselor management
- Wellness tracking
- Mental health resources
- Appointment scheduling

### 3. **Service Layer**

- **Technology**: NestJS with TypeScript
- **Location**: `/apps/api-server/src/features`
- **Pattern**: Modular feature-based architecture
- **Responsibility**:
  - Business logic implementation
  - Request validation using Zod
  - Service-to-service communication
  - Email notifications (Mail Sender)
  - Error handling and custom exceptions

**Core Services**:

- User Management
- Authentication & Authorization
- File/Attachment Management
- Social Features (Friendships, Discussions, Comments)
- Wellness Management
- Counseling Services
- System Configuration
- Content Moderation
- Role-Based Access Control

### 4. **Data Access Layer**

- **Technology**: Kysely (Type-safe SQL query builder)
- **Location**: `/packages/db`
- **Responsibility**:
  - Type-safe database queries
  - Migration management
  - Database schema versioning
  - ORM abstraction
  - Data validation and transformation

### 5. **Data Layer**

- **Database**: PostgreSQL
- **Schema Management**: Migrations in version control
- **Data Entities**:
  - User accounts and profiles
  - Social relationships (friendships, discussions)
  - Content (comments, attachments)
  - Wellness and counseling data
  - System configuration

---

## System Components

### Core Applications

#### **API Server** (`/apps/api-server`)

```
api-server/
├── src/
│   ├── app.module.ts           # Main NestJS module
│   ├── bootstrap.ts             # Bootstrap configuration
│   ├── main.ts                  # Entry point
│   ├── configs/                 # Configuration management
│   ├── features/                # Feature modules
│   │   ├── attachment/
│   │   ├── auth/
│   │   ├── comment/
│   │   ├── counselor/
│   │   ├── discussion/
│   │   ├── friendship/
│   │   ├── mail-sender/
│   │   ├── moderation/
│   │   ├── role-management/
│   │   ├── system/
│   │   ├── user/
│   │   └── wellness/
│   ├── filters/                 # Global exception filters
│   ├── interceptors/            # Request/response interceptors
│   ├── persistence/             # Database integration
│   ├── pipes/                   # Validation pipes
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
└── webpack.config.js            # Build configuration
```

**Features Module Pattern**:
Each feature module follows a consistent structure:

```
feature/
├── feature.module.ts            # NestJS module definition
├── feature.service.ts           # Business logic
├── feature.controller.ts        # HTTP endpoints
├── dto/                         # Data transfer objects
├── guards/                      # Route guards
├── interceptors/                # Feature-specific interceptors
└── types/                       # Feature-specific types
```

#### **Web Application** (`/apps/web`)

```
web/
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component
│   ├── theme.ts                 # Styling configuration
│   ├── components/              # Reusable UI components
│   ├── features/                # Feature-based pages
│   ├── lib/                     # Utilities and helpers
│   └── assets/                  # Static resources
└── vite.config.mts              # Build configuration
```

### Shared Packages

#### **1. Config Package** (`/packages/config`)

- Environment configuration management
- Static configuration (env.ts)
- Dynamic configuration with validation
- Supports both development and production environments

#### **2. Core Package** (`/packages/core`)

- **Constants**: Auth, attachment, ban, comment constants
- **HTTP**: Shared HTTP utilities and interceptors
- **Utils**: Common utility functions
- Provides reusable logic across the application

#### **3. DB Package** (`/packages/db`)

- **Kysely ORM Integration**: Type-safe database queries
- **Migration System**: Database schema versioning
- **Service Layer**: Abstraction for database operations
- **Configuration**: Database connection settings

#### **4. Contract Package** (`/packages/contract`)

- **Type Definitions**: Shared TypeScript interfaces
- **API Contracts**: Request/Response types for all endpoints
- **Domain Models**: Business entity definitions
- Organized by feature (user, auth, discussion, etc.)

#### **5. Transactional Package** (`/packages/transactional`)

- **Email System**: Email templates and rendering
- **Email Components**: Reusable email layout components
- **Styles**: Email-specific styling
- Built with React for template rendering

---

## Subsystem Description

### Subsystem 1: **Authentication & Authorization System**

**Components**:

- Auth Module (API Server)
- Auth Guards (JWT, Roles-based)
- Role Management Module
- User authentication flows

**Responsibilities**:

- User login/logout
- Token generation and validation
- Role-based access control
- Permission management

**Dependencies**:

- User Service
- Config Service
- Database layer

**Team Assignment**: Backend Authentication Team

---

### Subsystem 2: **Social & Community System**

**Components**:

- Discussion Module
- Comment Module
- Friendship Module
- Moderation Module

**Responsibilities**:

- User discussions and threads
- Comments on discussions
- Friend connections
- Content moderation and flagging

**Dependencies**:

- User Service
- Attachment Service
- Mail Sender Service
- Database layer

**Team Assignment**: Community Features Team

---

### Subsystem 3: **User Management System**

**Components**:

- User Module
- Attachment Module
- Profile Management

**Responsibilities**:

- User registration and account management
- Profile creation and updates
- Avatar and profile image handling
- User data persistence

**Dependencies**:

- Auth System
- Database layer
- Mail Sender Service

**Team Assignment**: Backend User Services Team

---

### Subsystem 4: **Wellness & Counseling System**

**Components**:

- Wellness Module
- Counselor Module
- Appointment/Booking Management

**Responsibilities**:

- Wellness data tracking
- Counselor management
- Appointment scheduling
- Mental health resource management

**Dependencies**:

- User Service
- Mail Sender Service
- Database layer

**Team Assignment**: Wellness & Counseling Team

---

### Subsystem 5: **Notification & Email System**

**Components**:

- Mail Sender Module
- Transactional Package (Email templates)
- Email rendering system

**Responsibilities**:

- Email template rendering
- Transactional email sending
- Notification queue management
- Email delivery tracking

**Dependencies**:

- Configuration Service
- Database layer

**Team Assignment**: Infrastructure & Notifications Team

---

### Subsystem 6: **Frontend UI System**

**Components**:

- React Web Application
- Feature-based pages
- Reusable components library
- Theming system

**Responsibilities**:

- User interface rendering
- Client-side validation
- State management
- Navigation and routing

**Dependencies**:

- API Server (via HTTP)
- Config Package

**Team Assignment**: Frontend/UI Team

---

### Subsystem 7: **System Management & Configuration**

**Components**:

- System Module
- Config Module
- Database migrations
- Monitoring and logging

**Responsibilities**:

- System-wide configuration
- Database initialization
- Health checks
- Logging and monitoring

**Dependencies**:

- Database layer
- Config Package

**Team Assignment**: DevOps & Infrastructure Team

---

## Team Organization

### Recommended Team Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    PeerNest Development Team                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Team Lead / Architect                                            │
│  └─ Overall architecture and system design                       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Backend Authentication Team (2-3 members)                       │
│  Subsystems: Authentication & Authorization                      │
│  Responsibilities:                                                │
│  • JWT implementation and token management                       │
│  • Role-based access control (RBAC)                              │
│  • Permission management system                                  │
│  • Security compliance                                           │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Backend User Services Team (2-3 members)                        │
│  Subsystems: User Management                                     │
│  Responsibilities:                                                │
│  • User registration and onboarding                              │
│  • Profile management                                            │
│  • Avatar and media handling                                     │
│  • User data validation                                          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Community Features Team (2-3 members)                           │
│  Subsystems: Social & Community System                           │
│  Responsibilities:                                                │
│  • Discussion features                                           │
│  • Comment system                                                │
│  • Friendship/connection features                                │
│  • Content moderation                                            │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Wellness & Counseling Team (2-3 members)                        │
│  Subsystems: Wellness & Counseling System                        │
│  Responsibilities:                                                │
│  • Wellness tracking features                                    │
│  • Counselor management                                          │
│  • Appointment scheduling                                        │
│  • Mental health resources                                       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Frontend/UI Team (2-3 members)                                  │
│  Subsystems: Frontend UI System                                  │
│  Responsibilities:                                                │
│  • React component development                                   │
│  • UI/UX implementation                                          │
│  • Form handling and validation                                  │
│  • Responsive design                                             │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure & Notifications Team (1-2 members)               │
│  Subsystems: Notification & Email System, System Management      │
│  Responsibilities:                                                │
│  • Email template system                                         │
│  • Transactional email delivery                                  │
│  • Database migrations                                           │
│  • System configuration                                          │
│  • Monitoring and logging                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Cross-Team Responsibilities

| Responsibility           | Team(s)                               |
| ------------------------ | ------------------------------------- |
| Database Schema Design   | Infrastructure + All Backend Teams    |
| API Contract Definition  | Backend User Services + Feature Teams |
| Security & Compliance    | Backend Authentication + All Teams    |
| Performance Optimization | Backend teams + Frontend Team         |
| Testing & QA             | All teams                             |
| CI/CD Pipeline           | Infrastructure Team                   |
| Documentation            | All teams (shared responsibility)     |

---

## Data Flow

### User Registration Flow

```
Client → API Server (User Module)
  ├→ Validation (User DTO)
  ├→ Auth Service (encrypt password)
  ├→ Database (persist user)
  └→ Mail Sender (send welcome email)
```

### Discussion Creation Flow

```
Client → API Server (Discussion Module)
  ├→ JWT Auth Guard (verify user)
  ├→ Discussion Service (create discussion)
  ├→ Database (store discussion)
  ├→ Mail Sender (notify followers)
  └→ Response to Client
```

### Authentication Flow

```
Client (login credentials)
  → API Server (Auth Module)
  → User Service (verify credentials)
  → Auth Service (generate JWT)
  → Response with Token
```

---

## Technology Stack

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript 5.9
- **Routing**: React Router DOM 6.29
- **Styling**: PostCSS
- **Validation**: Zod

### Backend

- **Framework**: NestJS 11
- **Language**: TypeScript 5.9
- **ORM**: Kysely
- **Database**: PostgreSQL
- **Validation**: Zod
- **Email**: Transactional email service

### Database

- **Type**: PostgreSQL
- **Migrations**: Version-controlled with Kysely
- **ORM Pattern**: Type-safe SQL queries

### Shared Infrastructure

- **Package Manager**: pnpm 10.4
- **Monorepo**: Nx 22.1
- **Linting**: ESLint 9
- **Formatting**: Prettier 3.4
- **Testing**: Vitest
- **CI/CD**: Git hooks (Husky)

---

## Integration Points

### Frontend ↔ Backend

- **Protocol**: HTTP/REST
- **Base URL**: Configured in Config Package
- **Authentication**: JWT Bearer tokens
- **Data Format**: JSON

### Internal Service Communication

- **Pattern**: Direct service method calls
- **Transaction Management**: Database-level transactions
- **Error Handling**: Custom exception filters

### External Services

- **Email**: SMTP service (configured via Config Package)
- **File Storage**: Attachment service integration

---

## Deployment Architecture

```
Production Environment
├── Load Balancer
│   ├── API Server instances (horizontal scaling)
│   └── Web Server instances (CDN/static hosting)
├── PostgreSQL Database
│   ├── Primary database
│   └── Backup/Replication
├── Email Service
│   └── SMTP provider
└── Object Storage (for attachments)
```

---

## Future Considerations

1. **Microservices**: Each subsystem can be extracted as independent microservice
2. **Event-Driven Architecture**: Add message queue (RabbitMQ/Kafka) for async operations
3. **Caching Layer**: Implement Redis for performance optimization
4. **API Versioning**: Support multiple API versions for backward compatibility
5. **GraphQL**: Consider GraphQL as alternative to REST
6. **Real-time Features**: WebSocket integration for live notifications

---

**Document Version**: 1.0  
**Last Updated**: January 6, 2026  
**Maintained By**: Architecture Team
