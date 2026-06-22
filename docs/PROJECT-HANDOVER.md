# Africa Governance Centre (AGC)
## Project Handover Manual

**Document version:** 1.0  
**Date:** 22 June 2026  
**Prepared for:** Africa Governance Centre  
**Repository:** [github.com/wastwagon/AGC](https://github.com/wastwagon/AGC)  
**Production site:** [https://www.africagovernancecentre.org](https://www.africagovernancecentre.org)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Development Stack](#3-development-stack)
4. [Repository Structure](#4-repository-structure)
5. [Public Website](#5-public-website)
6. [Admin Dashboard](#6-admin-dashboard)
7. [Database & Content Models](#7-database--content-models)
8. [API Endpoints](#8-api-endpoints)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [Environment Variables](#10-environment-variables)
11. [Hosting & Deployment](#11-hosting--deployment)
12. [Admin Credentials & Access](#12-admin-credentials--access)
13. [Local Development Setup](#13-local-development-setup)
14. [Operations & Maintenance](#14-operations--maintenance)
15. [Backup & Recovery](#15-backup--recovery)
16. [Security Checklist](#16-security-checklist)
17. [Testing & Quality Assurance](#17-testing--quality-assurance)
18. [Known Limitations & Future Enhancements](#18-known-limitations--future-enhancements)
19. [Support Contacts & References](#19-support-contacts--references)
20. [Appendix A — Credentials Worksheet](#appendix-a--credentials-worksheet)

---

## 1. Executive Summary

The **Africa Governance Centre (AGC)** website is a full-stack web application delivering a public-facing think-tank website with an integrated content management system. The project is **complete** and ready for handover.

**Key characteristics:**

- **Single application** — Next.js serves both the public site and the admin CMS; there is no separate headless CMS (no Directus, Strapi, etc.).
- **Content in PostgreSQL** — All editable content, form submissions, event registrations, and donations are stored in a PostgreSQL database via Prisma ORM.
- **Built-in admin** — Staff manage content at `/admin` using environment-configured credentials.
- **Docker-ready** — Full production stack (web, Postgres, Redis, migrations) ships as Docker Compose for VPS/Coolify deployment.
- **Alternative hosting** — Documented path to Vercel + Supabase for serverless deployment.

---

## 2. Project Overview

### 2.1 Purpose

The website promotes the Africa Governance Centre as an independent think tank focused on governance excellence across Africa. It provides:

- Information about programs, projects, and advisory work
- News and publications
- Event listings with online registration and QR check-in
- Volunteer, partnership, and career inquiry forms
- Online donations via Paystack
- Newsletter subscriptions

### 2.2 Client & Domain

| Item | Value |
|------|-------|
| Organisation | Africa Governance Centre |
| Primary domain | `www.africagovernancecentre.org` |
| Admin URL | `https://www.africagovernancecentre.org/admin` |
| Contact emails | `info@`, `programs@`, `media@`, `secretariat@` @africagovernancecentre.org |

### 2.3 Delivery Status

| Area | Status |
|------|--------|
| Public website | Complete |
| Admin CMS | Complete |
| Form submissions pipeline | Complete |
| Event registration & check-in | Complete |
| Donations (Paystack) | Complete |
| Docker deployment | Complete |
| Documentation | Complete |

---

## 3. Development Stack

### 3.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js (App Router) | 16.1.7 | SSR/SSG, API routes, admin UI |
| **Runtime** | Node.js | 20 (Alpine in Docker) | Server runtime |
| **Language** | TypeScript | 5.x | Type-safe application code |
| **UI Library** | React | 19.2.3 | Component rendering |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **ORM** | Prisma | 5.22.0 | Database access & migrations |
| **Database** | PostgreSQL | 16 (Alpine) | Primary data store |
| **Cache** | Redis | 7 (Alpine) | Rate limiting (optional in-memory fallback) |
| **Authentication** | NextAuth.js | 5.0 beta | Admin session management |
| **Email** | Resend | 6.x | Transactional email delivery |
| **Payments** | Paystack | Inline JS + REST API | Card donations |
| **Rich text** | TipTap | 3.x | Admin content editing |
| **Icons** | Lucide React | — | UI icons |
| **Fonts** | IBM Plex Sans, Fraunces | Google Fonts | Body and heading typography |
| **Error monitoring** | Sentry | 10.x (optional) | Production error tracking |
| **Testing** | Vitest + Playwright | — | Unit and E2E tests |
| **Linting** | ESLint | 9.x | Code quality |

### 3.2 Infrastructure Components

| Component | Image / Build | Role |
|-----------|---------------|------|
| **web** | `agc-site/Dockerfile` | Next.js production server (port 3000 internal) |
| **agc-db** | `postgres:16-alpine` | PostgreSQL for all application data |
| **redis** | `redis:7-alpine` | Rate limiting store |
| **migrate** | `agc-site/Dockerfile.migrate` | One-off Prisma migrate + seed before web starts |

### 3.3 Build & Tooling

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run dev` | `agc-site/` | Local dev server on port **9200** |
| `npm run build` | `agc-site/` | Production build |
| `npm run check` | `agc-site/` | Lint + unit tests + production build |
| `npm run test` | `agc-site/` | Vitest unit tests |
| `npm run test:e2e` | `agc-site/` | Playwright end-to-end tests |
| `npm run db:seed` | `agc-site/` | Seed baseline CMS content |
| `docker compose up -d --build` | repo root | Full stack production (local or VPS) |

---

## 4. Repository Structure

```
AGC/                              # Repository root
├── agc-site/                     # ★ Main application (Next.js)
│   ├── src/
│   │   ├── app/                  # Pages, API routes, admin
│   │   ├── components/           # Reusable UI components
│   │   ├── data/                 # Static content defaults & legal text
│   │   └── lib/                  # Utilities, content layer, auth
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── migrations/         # SQL migration history
│   │   └── seed.ts               # Baseline content seed
│   ├── public/                   # Static assets
│   ├── e2e/                      # Playwright tests
│   ├── Dockerfile                # Production web image
│   ├── Dockerfile.migrate        # Migration runner image
│   └── package.json
├── docker-compose.yml            # Full stack (web + DB + Redis + migrate)
├── docker-compose.web-only.yml   # Web only (external DB/Redis)
├── docker-compose.full.yml       # Alias for docker-compose.yml
├── .env.docker.example           # Docker env template (repo root)
├── docs/                         # Deployment & handover documentation
│   ├── PROJECT-HANDOVER.md       # This document
│   ├── COOLIFY-DEPLOY.md
│   ├── VERCEL-DEPLOY.md
│   ├── DOCKER-COMPOSE.md
│   └── ADMIN-SETUP.md
├── scripts/                      # Rebuild helpers
└── consultar/                    # Legacy reference assets (optional)
```

---

## 5. Public Website

### 5.1 Page Inventory

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, stats, news/events teasers, partner strip |
| `/about` | About the organisation |
| `/about/team/[id]` | Individual team member profile |
| `/our-work` | Overview of work pillars |
| `/our-work/programs` | Programs listing |
| `/our-work/projects` | Projects listing |
| `/our-work/advisory` | Advisory services |
| `/our-work/research` | Research |
| `/our-work/training` | Training |
| `/our-work/partnership` | Partnership information |
| `/events` | Upcoming events |
| `/events/past` | Past events archive |
| `/events/[slug]` | Event detail |
| `/events/register/[slug]` | Event registration form |
| `/events/badge/[id]` | Registration badge with QR code |
| `/news` | News listing |
| `/news/[slug]` | News article |
| `/news/category/[slug]` | News by category |
| `/news/tag/[slug]` | News by tag |
| `/news/feed.xml` | RSS feed |
| `/publications` | Publications listing |
| `/publications/[slug]` | Publication detail |
| `/get-involved` | Get involved overview |
| `/get-involved/volunteer` | Volunteer information |
| `/get-involved/partnership` | Partnership inquiry |
| `/get-involved/join-us` | Careers / join us |
| `/contact` | Contact form |
| `/applications` | Volunteer application form |
| `/subscribe` | Newsletter subscription |
| `/donate` | Online donation (Paystack) |
| `/app-summit` | APP Summit landing page |
| `/aypf` | AYPF page |
| `/awpls` | AWPLS page |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |

### 5.2 Public Forms

All public forms **save to PostgreSQL first**. Email notifications are sent when Resend is configured.

| Form | Route / API | Database model |
|------|-------------|----------------|
| Contact | `/contact` → `POST /api/contact` | `ContactSubmission` |
| Newsletter | `/subscribe` → `POST /api/newsletter` | `NewsletterSignup` |
| Volunteer / Staff / Fellow | `/applications` → `POST /api/applications` | `VolunteerApplication` |
| Partnership | `/get-involved/partnership` → `POST /api/partnerships` | `PartnershipInquiry` |
| Join Us (careers) | `/get-involved/join-us` → `POST /api/join-us` | `JoinUsInquiry` |
| Event registration | `/events/register/[slug]` → `POST /api/events/register` | `EventRegistration` |
| Donation | `/donate` → Paystack flow | `Donation` |

### 5.3 SEO & Discovery

- **Sitemap:** `/sitemap.xml` (generated from Prisma content)
- **Robots:** `/robots.txt`
- **Open Graph:** Configured via `NEXT_PUBLIC_SITE_URL`
- **JSON-LD:** Structured data on key pages
- **Site search:** Header search modal → `GET /api/search` (Fuse.js over content)

---

## 6. Admin Dashboard

### 6.1 Access

| Environment | Login URL |
|-------------|-----------|
| **Production** | `https://www.africagovernancecentre.org/admin/login` |
| **Local** | `http://localhost:9200/admin/login` |

After login, users are redirected to `/admin` (dashboard).

Authentication uses **NextAuth.js** with a single credentials provider. The admin user is defined by `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables (not stored in the database).

### 6.2 Admin Sections

| Section | Path | Purpose |
|---------|------|---------|
| Dashboard | `/admin` | Overview, inbox counts, quick links |
| Media | `/admin/media` | Upload and manage images (max 5 MB per file) |
| Events | `/admin/events` | Create/edit events, view registrations |
| Check-in Scanner | `/admin/events/scan` | QR code scanner for event check-in |
| News | `/admin/news` | News articles (rich text editor) |
| Team | `/admin/team` | Team members and bios |
| Publications | `/admin/publications` | Reports, policy briefs, PDFs |
| Programs | `/admin/programs` | Program descriptions |
| Projects | `/admin/projects` | Project descriptions |
| Advisory | `/admin/advisory` | Advisory service descriptions |
| Partners | `/admin/partners` | Partner logos and links |
| Donations | `/admin/donations` | Online gift history (Paystack) |
| Donation Settings | `/admin/donation-settings` | Paystack config, amounts, messages |
| Page Content | `/admin/pages` | Hero text for landing pages |
| Home Settings | `/admin/home-settings` | Homepage blocks, slider, stats |
| About Settings | `/admin/about-settings` | About page CMS fields |
| Site Settings | `/admin/site-settings` | Global contact, logos, social links |
| Taxonomy | `/admin/taxonomy` | News categories & publication types |
| Submissions | `/admin/submissions` | All form submissions, CSV export |
| Operations | `/admin/settings` | Manual migrate/seed, maintenance |

### 6.3 Content Publishing Workflow

1. Create or edit content in the relevant admin section.
2. Set status to **Published** to make content live (Draft content is hidden from the public site).
3. Successful saves show a **green banner**; validation errors show an **amber banner**.
4. For homepage content: edit via **Home Settings** or **Page Content → home**. Draft status uses code defaults; Published applies CMS edits.

### 6.4 Media Library

- Upload via **Admin → Media** or inline **Image Picker** in forms.
- Supported formats: JPEG, PNG, GIF, WebP, SVG (max **5 MB**).
- Media metadata stored in `data/media-library.json`; files in `public/uploads/`.
- **Docker:** Both paths are persisted in named volumes (`agc-media-uploads`, `agc-media-metadata`).
- **Vercel:** Media stored in Supabase Storage when configured.
- Images referenced by media ID (e.g. `media-abc123`) cannot be deleted until references are removed.

---

## 7. Database & Content Models

### 7.1 Connection

| Setting | Local (Docker) | Production |
|---------|----------------|------------|
| Host | `localhost:5436` | Internal Docker network or managed DB |
| Database | `agc` | `agc` or `postgres` (Supabase) |
| User | `agc` | As configured |
| Connection string | `DATABASE_URL` env var | `DATABASE_URL` env var |

### 7.2 Prisma Models

| Model | Table | Purpose |
|-------|-------|---------|
| `Event` | `events` | Events with registration settings |
| `News` | `news` | News articles |
| `Team` | `team` | Team members |
| `Publication` | `publications` | Reports and policy briefs |
| `Program` | `programs` | Program cards |
| `Project` | `projects` | Project cards |
| `Partner` | `partners` | Partner logos |
| `PageContent` | `page_content` | CMS page blocks (home, about, etc.) |
| `EventRegistration` | `event_registrations` | Event sign-ups with QR tokens |
| `NewsletterSignup` | `newsletter_signups` | Newsletter emails |
| `VolunteerApplication` | `volunteer_applications` | Volunteer/staff/fellow applications |
| `PartnershipInquiry` | `partnership_inquiries` | Partnership form submissions |
| `JoinUsInquiry` | `join_us_inquiries` | Careers inquiries |
| `ContactSubmission` | `contact_submissions` | Contact form submissions |
| `Donation` | `donations` | Paystack donation records |

### 7.3 Migrations

Migrations live in `agc-site/prisma/migrations/`. On every Docker deploy, the `migrate` service runs:

1. `npx prisma migrate deploy`
2. `npx prisma db seed` (idempotent baseline content; skip with `SKIP_DB_SEED_ON_DEPLOY=1`)

Manual fallback: **Admin → Operations** or shell:

```bash
cd agc-site && npx prisma migrate deploy && npx prisma db seed
```

---

## 8. API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/[...nextauth]` | GET, POST | — | NextAuth session |
| `/api/health` | GET | — | Full health check (includes DB) |
| `/api/health/live` | GET | — | Liveness probe (no DB) |
| `/api/contact` | POST | — | Contact form |
| `/api/newsletter` | POST | — | Newsletter signup |
| `/api/subscribe` | POST | — | Newsletter (alternate) |
| `/api/applications` | POST | — | Volunteer application |
| `/api/partnerships` | POST | — | Partnership inquiry |
| `/api/join-us` | POST | — | Join us inquiry |
| `/api/events/register` | POST | — | Event registration |
| `/api/events/check-in` | POST | Admin | QR/ID check-in |
| `/api/events/registrations` | GET | Admin | List registrations |
| `/api/events/registrations/export` | GET | Admin | CSV export |
| `/api/events/ics` | GET | — | iCalendar feed |
| `/api/media` | GET, POST | Admin | Media library |
| `/api/media/[id]` | DELETE | Admin | Delete media |
| `/api/admin/media/orphans` | GET, DELETE | Admin | Orphan media cleanup |
| `/api/admin/submissions/export` | GET | Admin | CSV export submissions |
| `/api/admin/maintenance` | POST | Admin | Maintenance tasks |
| `/api/search` | GET | — | Site search |
| `/api/page-content` | GET | — | Public page content API |
| `/api/donations/initialize` | POST | — | Start Paystack payment |
| `/api/donations/verify` | POST | — | Verify payment |
| `/api/donations/webhook` | POST | Paystack sig | Webhook for charge.success |
| `/uploads/[...file]` | GET | — | Serve uploaded media |

All public POST endpoints are **rate-limited** (Redis or in-memory).

---

## 9. Third-Party Integrations

### 9.1 Resend (Email)

| Item | Detail |
|------|--------|
| Purpose | Contact, application, registration, and submission notification emails |
| Dashboard | [resend.com](https://resend.com) |
| Env vars | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Default sender | `programs@africagovernancecentre.org` |
| Behaviour without key | Forms still save to DB; no email sent |

### 9.2 Paystack (Donations)

| Item | Detail |
|------|--------|
| Purpose | Worldwide card donations on `/donate` |
| Dashboard | [dashboard.paystack.com](https://dashboard.paystack.com) |
| Live env vars | `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` |
| Test env vars | `PAYSTACK_TEST_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY` |
| Webhook URL | `{SITE_URL}/api/donations/webhook` (event: `charge.success`) |
| Admin config | **Admin → Donation Settings** (amounts, test mode, messages) |

### 9.3 Supabase (Optional — Vercel deployment)

| Item | Detail |
|------|--------|
| Purpose | PostgreSQL database + media storage on serverless |
| Env vars | `DATABASE_URL` (pooler), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET`, `SUPABASE_SERVICE_ROLE_KEY` |
| When to use | Vercel deployment instead of Docker/Coolify |

### 9.4 Sentry (Optional)

| Item | Detail |
|------|--------|
| Purpose | Production error monitoring |
| Env vars | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` |

### 9.5 Analytics (Optional)

| Provider | Env var |
|----------|---------|
| Google Analytics 4 | `NEXT_PUBLIC_GA_ID` |
| Plausible | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` |

---

## 10. Environment Variables

### 10.1 Required (Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://agc:PASSWORD@agc-db:5432/agc?schema=public` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (SEO, OG, emails) | `https://www.africagovernancecentre.org` |
| `AUTH_URL` | Same as site URL (NextAuth cookies) | `https://www.africagovernancecentre.org` |
| `AUTH_SECRET` | NextAuth encryption secret | Generate: `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Admin login email | `admin@africagovernancecentre.org` |
| `ADMIN_PASSWORD` | Admin login password | Strong unique password |
| `AGC_DB_PASSWORD` | Postgres password (Docker Compose) | Strong unique password |

### 10.2 Recommended

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for email |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `REDIS_URL` | Redis for rate limiting (`redis://redis:6379` in Compose) |
| `PAYSTACK_SECRET_KEY` | Paystack live secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack live public key |

### 10.3 Optional

| Variable | Description |
|----------|-------------|
| `SKIP_DB_SEED_ON_DEPLOY` | Set `1` to skip seed on deploy |
| `SEED_RESET_PAGE_CONTENT` | Set `1` to overwrite page content from seed (destructive) |
| `WEB_PORT` | Host port for web (default `9200`) |
| `POSTGRES_HOST_PORT` | Host port for Postgres (default `5436`) |
| `NEXT_PUBLIC_*_URL` | Social media profile URLs |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking |
| `NEXT_PUBLIC_GA_ID` | Google Analytics |
| `DEV_WITHOUT_DB` | Local dev without Postgres (public site only) |

Templates: `.env.docker.example` (repo root), `agc-site/.env.example`.

---

## 11. Hosting & Deployment

### 11.1 Recommended: Coolify on VPS (Docker Compose)

This is the **primary documented production path**.

| Step | Action |
|------|--------|
| 1 | Connect GitHub repo `wastwagon/AGC` to Coolify |
| 2 | Create application → **Docker Compose** |
| 3 | Base directory: `/` (repo root) |
| 4 | Compose file: `/docker-compose.yml` |
| 5 | Attach domain to **`web`** service, container port **3000** |
| 6 | Set environment variables in Coolify UI (see §10) |
| 7 | Health check path: `/api/health/live` |
| 8 | Deploy |

**Services started:** `agc-db`, `redis`, `migrate`, `web`

**Volumes (persist across redeploys):**

| Volume | Contents |
|--------|----------|
| `agc-db-data` | PostgreSQL data |
| `redis-data` | Redis persistence |
| `agc-media-uploads` | Uploaded image files |
| `agc-media-metadata` | `media-library.json` |

**Local Docker equivalent:**

```bash
cp .env.docker.example .env
# Edit .env with production values
docker compose up -d --build
# Site: http://localhost:9200
```

After code changes, rebuild:

```bash
docker compose up -d --build web
```

### 11.2 Alternative: Vercel + Supabase

Documented in `docs/VERCEL-DEPLOY.md` for serverless hosting.

| Component | Service |
|-----------|---------|
| App hosting | Vercel (root directory: `agc-site`) |
| Database | Supabase PostgreSQL (Transaction pooler, port 6543) |
| Media storage | Supabase Storage (`media` bucket) |
| Build command | `npx prisma generate && npm run build` |

### 11.3 Web-Only Compose (External DB)

Use `docker-compose.web-only.yml` when Postgres and Redis are managed separately. Set `DATABASE_URL` and `REDIS_URL` manually.

### 11.4 DNS & Domain

| Record | Target |
|--------|--------|
| `www.africagovernancecentre.org` | Coolify/Vercel proxy IP or CNAME |
| Apex (`africagovernancecentre.org`) | Redirect or A record as needed |

Ensure `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` match the live HTTPS URL exactly.

### 11.5 Health Checks

| Endpoint | Use |
|----------|-----|
| `GET /api/health/live` | Docker/Coolify liveness (no DB dependency) |
| `GET /api/health` | Monitoring (returns 503 if DB unreachable) |

---

## 12. Admin Credentials & Access

> **Security notice:** Production passwords must never be committed to Git. Store actual credentials in a password manager and complete **Appendix A** separately. Rotate all secrets after handover if builders had access.

### 12.1 Admin Login

| Field | Configuration |
|-------|---------------|
| **URL (production)** | `https://www.africagovernancecentre.org/admin/login` |
| **URL (local)** | `http://localhost:9200/admin/login` |
| **Email** | Value of `ADMIN_EMAIL` env var |
| **Password** | Value of `ADMIN_PASSWORD` env var |
| **Session secret** | Value of `AUTH_SECRET` env var |

### 12.2 Default Local Development Credentials

For local development only (from `agc-site/.env.example`):

| Field | Value |
|-------|-------|
| Email | `admin@africagovernancecentre.org` |
| Password | `admin123` |
| AUTH_SECRET | `dev-secret-change-in-production` |

> Change these before any non-local deployment.

### 12.3 Where Credentials Are Set

| Environment | Location |
|-------------|----------|
| Local dev | `agc-site/.env.local` |
| Docker (local/VPS) | Repo root `.env` → passed to Compose |
| Coolify | Application → Environment Variables |
| Vercel | Project → Settings → Environment Variables |

### 12.4 Other Service Accounts

See **Appendix A — Credentials Worksheet** for recording:

- Coolify / VPS SSH and panel login
- Domain registrar
- GitHub repository access
- Resend account
- Paystack merchant account
- Supabase project (if used)
- Sentry project (if used)

---

## 13. Local Development Setup

### 13.1 Prerequisites

- Node.js 20+
- npm
- Docker Desktop (for Postgres) or local PostgreSQL
- Git

### 13.2 Quick Start

```bash
git clone https://github.com/wastwagon/AGC.git
cd AGC

# Start Postgres only
docker compose up -d agc-db

# Configure app
cd agc-site
cp .env.example .env.local
# Edit DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm ci
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:9200](http://localhost:9200). Admin: [http://localhost:9200/admin](http://localhost:9200/admin).

### 13.3 Verify Build

```bash
cd agc-site
npm run check    # lint + tests + production build
```

### 13.4 Seed Content (Optional)

```bash
cd agc-site
npm run db:seed
```

---

## 14. Operations & Maintenance

### 14.1 Deploying Updates

1. Push changes to `main` branch on GitHub.
2. Coolify auto-deploys (or trigger manual redeploy).
3. `migrate` service applies new Prisma migrations automatically.
4. `web` service restarts with new image.

### 14.2 Post-Deploy Checklist

| Check | Action |
|-------|--------|
| Site loads | Visit homepage |
| Admin login | Test `/admin/login` |
| Database | Confirm new migrations applied |
| Forms | Submit test contact (delete from admin after) |
| Images | Verify media thumbnails load |
| Donations | Test in Paystack test mode if configured |

### 14.3 Common Tasks

| Task | How |
|------|-----|
| Add news article | Admin → News → New |
| Upload image | Admin → Media → Upload |
| View form submissions | Admin → Submissions |
| Export submissions CSV | Submissions page → Export |
| Event check-in | Admin → Check-in Scanner |
| Run migrations manually | Admin → Operations |
| Rebuild Docker web only | `docker compose up -d --build web` |

### 14.4 Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin login fails | Verify `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_URL` |
| "No available server" (Coolify) | Attach domain to `web` port 3000; health check `/api/health/live` |
| Images 404 after redeploy | Ensure Docker volumes `agc-media-uploads` and `agc-media-metadata` are bound |
| DB connection error | Check `DATABASE_URL` / `AGC_DB_PASSWORD`; verify Postgres is healthy |
| Emails not sending | Verify `RESEND_API_KEY` and verified `RESEND_FROM_EMAIL` domain |
| Donations unavailable | Check Paystack keys in env + Admin → Donation Settings |
| Old UI after code change | Rebuild Docker image: `docker compose up -d --build web` |

---

## 15. Backup & Recovery

### 15.1 What to Back Up

| Asset | Location | Frequency |
|-------|----------|-----------|
| PostgreSQL database | `agc-db` volume or managed DB | Daily |
| Uploaded images | `agc-media-uploads` volume / `public/uploads/` | Daily |
| Media metadata | `agc-media-metadata` volume / `data/media-library.json` | Daily |
| Environment variables | Coolify/Vercel UI (export separately) | On change |
| Source code | GitHub repository | Continuous (Git) |

### 15.2 Database Backup (Docker)

```bash
docker compose exec agc-db pg_dump -U agc agc > agc-backup-$(date +%Y%m%d).sql
```

### 15.3 Database Restore

```bash
cat agc-backup-YYYYMMDD.sql | docker compose exec -T agc-db psql -U agc agc
```

### 15.4 Media Backup

Archive both volumes or directories together (metadata and files must stay in sync):

```bash
tar -czf agc-media-$(date +%Y%m%d).tar.gz data/media-library.json public/uploads/
```

---

## 16. Security Checklist

| Item | Status / Action |
|------|-----------------|
| `AUTH_SECRET` set to strong random value in production | ☐ Verify |
| `ADMIN_PASSWORD` changed from defaults | ☐ Verify |
| `AGC_DB_PASSWORD` strong and not default `agc_secret` | ☐ Verify |
| `.env` files not committed to Git | ☐ Verify |
| Postgres not exposed to public internet | ☐ Verify |
| HTTPS enabled on production domain | ☐ Verify |
| Resend sender domain verified | ☐ Verify |
| Paystack webhook secret configured | ☐ Verify |
| Rate limiting active (`REDIS_URL` in multi-instance) | ☐ Verify |
| Rotate credentials after builder handover | ☐ Action required |
| Remove or secure `ADMIN_CREDENTIALS.md` from shared copies | ☐ Action required |

---

## 17. Testing & Quality Assurance

| Test type | Command | Location |
|-----------|---------|----------|
| Lint | `npm run lint` | `agc-site/` |
| Unit tests | `npm run test` | `agc-site/` (Vitest) |
| Full check | `npm run check` | lint + test + build |
| E2E tests | `npm run test:e2e` | `agc-site/e2e/` (Playwright) |

E2E setup: `npx playwright install chromium` (first time only).

---

## 18. Known Limitations & Future Enhancements

| Topic | Current state | Recommendation |
|-------|---------------|----------------|
| Multi-user admin | Single shared credentials | Add NextAuth DB adapter + User model if multiple staff need accounts |
| Language selector | UI only; no i18n | Remove or implement `next-intl` |
| Newsletter campaigns | Signups stored only | Export CSV; use Mailchimp/Resend Audiences |
| Placeholder content | Some testimonial/hero defaults | Replace via Admin with approved copy |
| Media at scale | Local disk or Supabase | S3-compatible storage if traffic grows |
| APP Summit registration | Generic contact CTA | Dedicated registration flow if needed |

Full gap analysis: `agc-site/docs/GAPS-DESIGN-FEATURES-FUNCTIONALITY.md`

---

## 19. Support Contacts & References

### 19.1 In-Repository Documentation

| Document | Path | Topic |
|----------|------|-------|
| Main README | `README.md` | Quick start, structure |
| App README | `agc-site/README.md` | Development, CMS usage |
| Admin setup | `docs/ADMIN-SETUP.md` | Admin sections |
| Coolify deploy | `docs/COOLIFY-DEPLOY.md` | VPS deployment |
| Vercel deploy | `docs/VERCEL-DEPLOY.md` | Serverless deployment |
| Docker Compose | `docs/DOCKER-COMPOSE.md` | Stack layout |
| UX / Accessibility | `agc-site/docs/UX-A11Y.md` | UI patterns |
| Gap analysis | `agc-site/docs/GAPS-DESIGN-FEATURES-FUNCTIONALITY.md` | Handover checklist |

### 19.2 External Services

| Service | URL |
|---------|-----|
| GitHub repository | https://github.com/wastwagon/AGC |
| Resend | https://resend.com |
| Paystack | https://dashboard.paystack.com |
| Prisma docs | https://www.prisma.io/docs |
| Next.js docs | https://nextjs.org/docs |

---

## Appendix A — Credentials Worksheet

> **Instructions:** Print or save this appendix separately. Do not commit completed copies to Git.

| Service | URL / Host | Username / Email | Password / Key | Notes |
|---------|------------|------------------|----------------|-------|
| **Website admin** | `/admin/login` | | | `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| **AUTH_SECRET** | — | — | | `openssl rand -base64 32` |
| **PostgreSQL** | | user: `agc` | | `AGC_DB_PASSWORD` or `DATABASE_URL` |
| **Coolify panel** | | | | VPS hosting control |
| **VPS SSH** | | | | Server root/sudo access |
| **Domain registrar** | | | | DNS management |
| **GitHub** | github.com/wastwagon/AGC | | | Repo access |
| **Resend** | resend.com | | API key: | `RESEND_API_KEY` |
| **Paystack** | dashboard.paystack.com | | Live + test keys | Webhook URL configured |
| **Supabase** (if used) | | | Service role key | Storage + DB |
| **Sentry** (if used) | | | DSN | Error monitoring |

**Production admin login URL:** `https://www.africagovernancecentre.org/admin/login`

**Webhook URL (Paystack):** `https://www.africagovernancecentre.org/api/donations/webhook`

---

*End of document — Africa Governance Centre Project Handover Manual v1.0*
