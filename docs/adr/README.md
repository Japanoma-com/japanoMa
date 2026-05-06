# Architecture Decision Records

This directory contains all Architecture Decision Records (ADRs) for the Japanoma Buyer Insight Platform.

## What is an ADR?

An Architecture Decision Record captures a significant architectural decision made during the project, including the context, options considered, and rationale for the chosen approach. ADRs provide a historical record that helps the team understand why decisions were made and inform future choices.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](001-framework-nextjs-15.md) | Framework: Next.js 15 with App Router | Accepted | 2026-02-27 |
| [ADR-002](002-database-and-orm.md) | Database & ORM: Supabase PostgreSQL + Drizzle ORM | Accepted | 2026-02-27 |
| [ADR-003](003-auth-strategy.md) | Auth Strategy: NextAuth.js v5 with Supabase Adapter | Accepted | 2026-02-27 |
| [ADR-004](004-cms-choice.md) | CMS: Sanity Studio (Hosted) | Accepted | 2026-02-27 |
| [ADR-005](005-analytics-tracking.md) | Analytics: Custom Event Tracking + Plausible | Accepted | 2026-02-27 |
| [ADR-006](006-state-management.md) | State Management: TanStack Query + Zustand + nuqs | Accepted | 2026-02-27 |
| [ADR-007](007-ui-components.md) | UI Components: shadcn/ui + Tailwind CSS | Accepted | 2026-02-27 |
| [ADR-008](008-form-handling.md) | Form Handling: React Hook Form + Zod | Accepted | 2026-02-27 |
| [ADR-009](009-charting-library.md) | Charting Library: Recharts | Accepted | 2026-02-27 |
| [ADR-010](010-deployment.md) | Deployment: Vercel | Accepted | 2026-02-27 |
| [ADR-011](011-seo-strategy.md) | SEO Strategy: Dynamic Metadata + JSON-LD + ISR | Accepted | 2026-02-27 |
| [ADR-012](012-privacy-compliance.md) | Privacy & Compliance: APPI + Australian Privacy Act + GDPR | Accepted | 2026-02-27 |

## Decision Process

Decisions are made by **Obi** (Technical Lead) with input from **Sara** (Project Manager), considering:

- Project budget ($8,640 AUD total)
- Timeline (13 weeks, 3 phases)
- Team size (2 person Craefto team: Obi + Sara)
- Client needs (Kaz and Shiun at Go&C Partners)
- Japan property market niche
- Buyer intent analytics as core product value

## Superseding Decisions

When a decision is superseded, the original ADR status is updated to "Superseded by ADR-XXX" and a new ADR is created referencing the original.
