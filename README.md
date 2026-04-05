# ChristianWriter.ai

AI-powered writing tools for Christian content creators. Create devotionals, sermons, and social media content with Scripture at the center.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS (dark theme) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 (Google OAuth + credentials) |
| AI | Anthropic Claude API |
| Payments | Stripe (subscriptions) |
| Export | docx + React-PDF |


## Features

- **Devotional Generator** — Create meaningful daily devotionals with Scripture references and reflection questions
- **Sermon Outline Generator** — Generate structured sermon outlines in expository, topical, or narrative styles
- **Social Media Content** — Craft engaging posts optimized for Twitter, Facebook, Instagram, and LinkedIn
- **Author Voice Matching** — Train the AI to match your unique writing style
- **Scripture Integration** — Access NIV, ESV, KJV, and more Bible versions
- **Export Options** — Download content as Word documents or PDF files
- **Theological Guardrails** — AI configured for Scripture-first, theologically accurate content generation


## Getting Started

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database
- Anthropic API key
- Stripe account
- Redis instance

### Installation

```bash
git clone https://github.com/timjeromeadams1109/christianwriter-ai.git
cd christianwriter-ai
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_URL` | Application URL for NextAuth |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Run

```bash
npm run dev
```


## Project Structure

```
christianwriter-ai/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Landing, pricing, features pages
│   │   ├── (auth)/           # Sign-in, sign-up pages
│   │   ├── (dashboard)/      # Protected routes
│   │   │   └── dashboard/
│   │   │       ├── devotionals/
│   │   │       ├── sermons/
│   │   │       ├── social/
│   │   │       └── author-voice/
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # Base components
│   │   ├── layout/           # Navbar, Footer, Sidebar
│   │   ├── generators/       # Content creation forms
│   │   └── marketing/        # Landing page sections
│   └── lib/
│       ├── db/               # Drizzle schema + connection
│       ├── ai/               # Claude client + prompts
│       ├── scripture/        # Bible API integration
│       └── export/           # PDF/Word export utilities
├── drizzle/                  # Migration files
└── scripts/                  # Build & generation scripts
```


## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | next dev |
| `npm run build` | next build |
| `npm run start` | next start |
| `npm run lint` | eslint |
| `npm run db:generate` | drizzle-kit generate |
| `npm run db:migrate` | drizzle-kit migrate |
| `npm run db:push` | drizzle-kit push |
| `npm run db:studio` | drizzle-kit studio |
| `npm run test` | vitest run |
| `npm run test:watch` | vitest |
| `npm run test:coverage` | vitest run --coverage |


## Deployment

Deployed on **Vercel** with automatic deploys from the `main` branch.

1. Push to `main` triggers Vercel build
2. Configure env vars in Vercel dashboard
3. Database hosted on Neon (serverless PostgreSQL)


## Links

- [GitHub](https://github.com/timjeromeadams1109/christianwriter-ai)
- [Vercel Dashboard](https://vercel.com/tim-adams-projects-6c46d12d/christianwriter-ai)


## License

MIT

---
*Auto-generated from project.meta.json — do not edit manually.*
