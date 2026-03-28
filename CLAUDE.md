# ChristianWriter AI — Claude Code Context

## What This Is
An AI-powered writing tool for Christian content creators — sermons, devotionals, Bible studies, and ministry documents with PDF/DOCX export.

## Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Neon Postgres (serverless) via Drizzle ORM
- **AI**: Anthropic Claude SDK, Vercel AI SDK
- **Auth**: NextAuth v5 (beta) with Drizzle adapter, bcrypt
- **Payments**: Stripe
- **Export**: React PDF, docx (Word generation)
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide icons
- **Monitoring**: Sentry (client, server, edge)
- **Hosting**: Vercel

## Rules for This Repo
- Run `npm install` before making changes
- DB commands: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`, `npm run db:studio`
- Drizzle schema changes require running `db:generate` then `db:migrate`
- Zod validation on all API routes
- AI temperature: 0.3 for writing assistance, 0.7 for creative content
- Uses `@stack/core` shared package — don't modify without checking other consumers
- Never deploy without Tim's approval

## Maven Context
This is a Studio Tim product managed by the Maven agent system.
Operator: Tim Adams | Studio Tim
