# ChristianWriter.ai

AI-powered writing tools for Christian content creators. Create devotionals, sermons, and social media content with Scripture at the center.

## Features

- **Devotional Generator** - Create meaningful daily devotionals with Scripture references, reflection questions, and practical applications
- **Sermon Outline Generator** - Generate structured sermon outlines in expository, topical, or narrative styles
- **Social Media Content** - Craft engaging posts optimized for Twitter, Facebook, Instagram, and LinkedIn
- **Author Voice Matching** - Train the AI to match your unique writing style
- **Scripture Integration** - Access NIV, ESV, KJV, and more Bible versions
- **Export Options** - Download content as Word documents or text files

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (dark theme)
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5 (Google OAuth + credentials)
- **AI**: Anthropic Claude API
- **Export**: docx + file-saver

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Anthropic API key
- Google OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd christianwriter-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ANTHROPIC_API_KEY=sk-ant-...
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
christianwriter-ai/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Landing, pricing, features pages
│   │   ├── (auth)/           # Sign-in, sign-up pages
│   │   ├── (dashboard)/      # Protected routes
│   │   │   ├── dashboard/
│   │   │   │   ├── devotionals/
│   │   │   │   ├── sermons/
│   │   │   │   ├── social/
│   │   │   │   ├── author-voice/
│   │   │   │   └── history/
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # Base components (Button, Card, Input, etc.)
│   │   ├── layout/           # Navbar, Footer, Sidebar
│   │   ├── generators/       # Content creation forms
│   │   └── marketing/        # Landing page sections
│   └── lib/
│       ├── db/               # Drizzle schema + connection
│       ├── ai/               # Claude client + prompts
│       ├── scripture/        # Bible API integration
│       ├── export/           # PDF/Word export utilities
│       └── utils/            # Helper functions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Theological Guardrails

The AI is configured with theological guardrails to ensure:
- Scripture-first content generation
- Theological accuracy (Trinity, deity of Christ, salvation by grace)
- Pastoral sensitivity
- Human-in-the-loop philosophy (generates outlines, not final content)

## Deploy on Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy

## License

MIT
