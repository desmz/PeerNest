# PeerNest

A peer support and wellness social platform that connects students with peers, enables wellness tracking, and facilitates community discussions — all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Scripts](#development-scripts)
- [Project Links](#project-links)
- [Project Status](#project-status)

---

## Features

- **Peer Discovery** — Search and connect with peers based on shared interests and personal goals
- **Friendship System** — Send/accept friend requests and manage your peer network
- **Discussion Forum** — Create and participate in topic-based discussions with likes and nested comments
- **Wellness Tracking** — Log daily moods, symptoms, and wellness factors; view trends and history via calendar
- **Real-time Notifications** — Instant in-app notifications via WebSocket for friend requests, replies, and more
- **User Profiles** — Customizable profiles with avatar, pronouns, university, interests, goals, and achievements
- **Achievement System** — Earn and showcase achievements on your profile
- **Counselor Support** — Counselors can manage a list of mentees and add private support notes
- **Moderation Tools** — Moderators can archive discussions, manage reports, and issue bans
- **Role Management** — Users can apply for Counselor or Moderator roles; Admins approve/reject applications
- **File Attachments** — Upload images and files to discussions, stored securely in AWS S3
- **Transactional Emails** — Automated emails for account verification, password reset, and notifications
- **Google OAuth** — Sign in with Google in addition to email/password

---

## Tech Stack

| Layer               | Technologies                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **API Server**      | NestJS, TypeScript, PostgreSQL, Kysely ORM, Passport.js (JWT + Google OAuth), Socket.io, AWS S3, Nodemailer           |
| **Web**             | React 19, React Router v7, TypeScript, Vite, Mantine UI v8, Jotai, TanStack Query, TipTap, Recharts, Socket.io client |
| **Shared Packages** | Zod (validation), bcryptjs, date-fns, React Email                                                                     |
| **Tooling**         | Nx, pnpm workspaces, SWC, ESLint, Prettier, Husky, Commitlint                                                         |

---

## Project Structure

```
peernest/
├── apps/
│   ├── api-server/         # NestJS REST + WebSocket API
│   └── web/                # React + Vite frontend
└── packages/
    ├── config/             # Environment variable management (Zod)
    ├── contract/           # Shared API types & Zod schemas
    ├── core/               # Shared utilities & constants
    ├── db/                 # Database layer (Kysely ORM, migrations)
    └── transactional/      # Transactional email templates (React Email)
```

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10.4 — install with `npm install -g pnpm`
- **PostgreSQL** >= 15 (local instance or remote)
- **AWS Account** with two S3 buckets (public + private) and SES configured for email delivery
- **Google OAuth credentials** — create a project at [Google Cloud Console](https://console.cloud.google.com/) and enable the OAuth 2.0 API

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/desmz/PeerNest.git
cd peernest
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

| Variable                                                    | Description                                      |
| ----------------------------------------------------------- | ------------------------------------------------ |
| `PG_DATABASE_*`                                             | PostgreSQL connection details                    |
| `AUTH_JWT_ACCESS_SECRET`                                    | Secret key for signing JWT tokens                |
| `BACKEND_GOOGLE_CLIENT_ID` / `BACKEND_GOOGLE_CLIENT_SECRET` | Google OAuth credentials                         |
| `BACKEND_STORAGE_*`                                         | AWS S3 bucket names, region, and credentials     |
| `BACKEND_MAIL_*`                                            | SMTP or AWS SES configuration for email delivery |

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run database migrations

```bash
pnpm migration:latest
```

### 5. (Optional) Seed the database

```bash
pnpm db:seed <file_name>
```

All seed files are located in `packages/db/seeds`. You can run them individually by specifying the file name. For example:

```bash
pnpm db:seed notification-type.seed.ts
```

### 6. Start development servers

```bash
pnpm many:serve
```

- API server: http://localhost:3000
- Web app: http://localhost:3001

---

## Development Scripts

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `pnpm many:serve`       | Start all apps in development mode                  |
| `pnpm many:lint`        | Lint all packages                                   |
| `pnpm many:typecheck`   | Type-check all packages                             |
| `pnpm migration:create` | Create a new database migration file                |
| `pnpm migration:up`     | Run the next pending migration                      |
| `pnpm migration:down`   | Roll back the last migration                        |
| `pnpm migration:latest` | Apply all pending migrations                        |
| `pnpm db:seed`          | Seed the database with initial data                 |
| `pnpm email:dev`        | Start the email template preview server (port 4040) |

---

## Project Links

- [UI Design (Figma)](https://www.figma.com/design/pzZKNhbWvfcgPGev7j11LA/Peer-Support-App?node-id=0-1&t=GAvVcqeRXhjO7yYq-1)
- [Information Architecture (FigJam)](https://www.figma.com/board/8WWx0m9Id4h35LFa8sYCNn/Peer-Support-App?t=fi7sYYqjIAWGxrgM-1)
- [ERD Diagram](./doc/Digital%20Peer%20System%20UML%20Diagrams-ERD%20Diagram.drawio.png)
- [API Testing](https://documenter.getpostman.com/view/50248190/2sBXirinhv)

---

## Project Status

> This project is actively under development. The following tracks feature completeness across all areas.

### Backend (API Server)

- [x] Authentication (email/password, Google OAuth, JWT, password reset, email verification)
- [x] User profiles & management
- [x] Discussion forum (CRUD, likes, archive/unarchive)
- [x] Comments & replies (CRUD, likes)
- [x] Friendship system (requests, accept/reject, unfriend)
- [x] Wellness tracking (check-ins, moods, symptoms, factors, stats, trends, calendar)
- [x] Notifications (real-time via WebSocket + email)
- [x] Counselor / mentorship system
- [x] Moderation (content reports, ban requests, bans)
- [x] Role management (apply, approve/reject, change roles)
- [x] Achievements system
- [x] File attachments (S3 presigned URLs)
- [x] Transactional emails (React Email templates)
- [ ] Direct messaging / chat API endpoints
- [ ] Wellness dashboard endpoint (`/api/wellness/dashboard`)
- [ ] API documentation (Swagger/OpenAPI)

### Frontend (Web)

- [x] Authentication pages (sign in, sign up, forgot/reset password)
- [x] User profile pages (view, edit, avatar upload)
- [x] Peer discovery / matching page
- [x] Discussion forum pages (list, detail, create)
- [x] Wellness tracking pages (check-in form, dashboard)
- [x] Achievements page
- [x] Moderation pages (manage discussions, manage reports)
- [ ] Notifications UI
- [ ] Counselor management pages
- [ ] Direct messaging / chat UI
- [ ] UI design completion (several pages incomplete)
- [ ] Admin panel

### Infrastructure & Developer Experience

- [x] Monorepo setup (Nx + pnpm workspaces)
- [x] Database migrations (Kysely)
- [x] Pre-commit hooks (Husky + lint-staged + Commitlint)
- [x] Environment variable validation (Zod)
- [x] Google OAuth integration
- [x] AWS S3 integration
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker / docker-compose setup
- [ ] Automated tests (unit + e2e)
