# RevTrack — Commission Tracker for Hubspot

A multi-user SaaS application that tracks sales commissions by pulling deal data from Hubspot CRM.

## Features

- **Hubspot OAuth** — Sign in with your Hubspot account
- **Rep Dashboard** — View MTD/QTD earnings, quota progress, and deal-level commission breakdowns
- **Admin Panel** — Configure commission plans with base rates, thresholds, and accelerator rates
- **Hubspot Sync** — Pull "Closed Won" deals and automatically calculate commissions
- **Role-based Access** — Admin and Rep roles with route-level protection

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React
- **Auth:** NextAuth.js with Hubspot OAuth 2.0
- **Database:** Prisma with PostgreSQL
- **API:** Hubspot Node.js SDK

## Getting Started

1. Copy `.env.example` to `.env` and fill in your credentials
2. Set up a PostgreSQL database and update `DATABASE_URL`
3. Run migrations: `npx prisma migrate dev`
4. Start development: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Commission Logic

- **Base Rate** applies to all revenue up to the threshold
- **Accelerator Rate** applies to revenue exceeding the threshold in the current quarter
- Deals that straddle the threshold are split proportionally
