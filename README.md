# OLMA - Peer Learning Network

[![CI](https://github.com/PricePepel/OLMA/actions/workflows/ci.yml/badge.svg)](https://github.com/PricePepel/OLMA/actions/workflows/ci.yml)

A peer-to-peer learning platform: skill exchange, learning clubs, events, and gamified rankings. I founded it and shipped it end to end in 4 months. It was implemented at School No. 166, where it's still in use by 300 active users, and Bloomin incorporated its coach-to-student relationship code.

**Live:** [olma-tau.vercel.app](https://olma-tau.vercel.app)

## 🚀 Features

- **Skill Exchange**: Teach what you know, learn what you don't
- **Learning Clubs**: Create and join clubs around your interests
- **Events & Meetups**: Discover and attend local learning events
- **Direct Messaging**: Chat with other learners and teachers
- **Location-based Matching**: Find learners and teachers near you
- **Gamification**: Earn points, unlock achievements, and climb leaderboards
- **Real-time Notifications**: Stay updated with instant notifications
- **Responsive Design**: Works perfectly on all devices
- **Dark Mode**: Beautiful dark and light themes

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form, Zod validation
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/PricePepel/OLMA.git
cd OLMA
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Google Site Verification
GOOGLE_SITE_VERIFICATION=your_google_site_verification_code
```

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Apply the database migrations:

```bash
# Apply the complete schema migration
# Copy the SQL from supabase/migrations/006_complete_schema_fix.sql
# and run it in your Supabase SQL Editor
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄 Database Setup

### 1. Apply Migrations

Go to your Supabase Dashboard → SQL Editor and run the following migration:

```sql
-- Complete OLMA Database Schema Fix
-- This migration creates a production-ready database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_restrictions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS currency_transactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS club_members CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS club_role CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS achievement_type CASCADE;

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE club_role AS ENUM ('owner', 'moderator', 'member');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE report_type AS ENUM ('inappropriate_content', 'harassment', 'spam', 'fake_profile', 'other');
CREATE TYPE achievement_type AS ENUM ('skill_teaching', 'skill_learning', 'club_creation', 'event_attendance', 'streak', 'currency_earned');

-- Create all tables (see full migration in supabase/migrations/006_complete_schema_fix.sql)
-- ... (full migration content)
```

### 2. Enable Row Level Security (Optional)

For production, you may want to enable RLS policies. See `supabase/migrations/003_updated_rls_policies.sql` for examples.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

CI runs lint, type checking, unit tests, a production build and `e2e/smoke.spec.ts` on every push. The smoke test needs no Supabase project. `e2e/signup-flow.spec.ts` does, so it only runs locally.

## 🧭 Design notes

**Both people teach.** A meeting invitation stores a skill from each side (`inviter_skill_id` and `invitee_skill_id`), so a meeting is a two-way exchange rather than a lesson one person buys from another.

**Coins are awarded in the database.** A Postgres trigger pays out when a meeting's status changes to `completed`, at 1 coin per minute of actual duration, falling back to the planned duration. Any code path that completes a meeting pays the same way. See `database/update_meeting_system_50_50.sql`.

**Known limits:**

- The content rate limiter is an in-memory `Map`, so on serverless hosting it applies per instance, not across the whole deployment. Making it hold everywhere needs a shared store such as Postgres or Redis.
- `supabase/migrations/` has overlapping history from the MVP. `006_complete_schema_fix.sql` is the one to apply to a new project, and one-off scripts are in `database/`.
- The E2E smoke test covers public pages, not flows that need a live Supabase project.

## 🏗 Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Configure environment variables**
   - Go to your Vercel project settings
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

3. **Deploy**
   - Push to your main branch
   - Vercel will automatically deploy

### Deploy to Other Platforms

#### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard

#### Railway

1. Connect your GitHub repository
2. Add environment variables
3. Railway will automatically deploy

#### Self-hosted

1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Use a reverse proxy (nginx) for production

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes |
| `NEXTAUTH_URL` | Your app's URL for NextAuth | Yes |

### Customization

#### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/app/globals.css` for global styles
- Customize Shadcn/ui components in `src/components/ui/`

#### Features
- Add new API routes in `src/app/api/`
- Create new pages in `src/app/`
- Add new components in `src/components/`

## 📱 Mobile App (Future)

OLMA is designed to be mobile-first and can be easily converted to a React Native app using:
- React Native
- Expo
- Supabase React Native SDK

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.olma.com](https://docs.olma.com)
- **Issues**: [GitHub Issues](https://github.com/PricePepel/OLMA/issues)
- **Discord**: [Join our community](https://discord.gg/olma)
- **Email**: support@olma.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for the deployment platform

## 📊 Analytics

OLMA includes built-in analytics to track user engagement and platform usage. Analytics are privacy-focused and respect user preferences.

## 🔒 Security

- All API routes are protected with authentication
- Input validation using Zod schemas
- Rate limiting to prevent abuse
- Security headers for protection against common attacks
- Regular security audits and updates

## 🚀 Performance

- Server-side rendering for better SEO
- Image optimization with Next.js
- Code splitting for faster loading
- Caching strategies for better performance
- CDN integration for static assets

---

Made with ❤️ by the OLMA team

