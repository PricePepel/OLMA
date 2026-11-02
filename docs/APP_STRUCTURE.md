# OLMA MVP - Next.js 15 App Structure

## Overview

This document outlines the complete app structure for the OLMA MVP, built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Directory Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (public)/                 # Public route group (unauthenticated)
│   │   ├── layout.tsx           # Public layout with auth redirect
│   │   ├── sign-in/
│   │   │   └── page.tsx         # Sign-in page
│   │   └── sign-up/
│   │       └── page.tsx         # Sign-up page
│   ├── (auth)/                   # Auth route group (authenticated)
│   │   ├── layout.tsx           # Auth layout with auth check
│   │   └── profile/
│   │       └── page.tsx         # Profile management page
│   ├── (main)/                   # Main app route group (authenticated)
│   │   ├── layout.tsx           # Main layout with navigation
│   │   ├── feed/
│   │   │   └── page.tsx         # Community feed
│   │   ├── skills/
│   │   │   └── page.tsx         # Skills directory
│   │   ├── offers/
│   │   │   └── page.tsx         # Skill offers
│   │   ├── clubs/
│   │   │   ├── page.tsx         # Clubs listing
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Individual club page
│   │   ├── messages/
│   │   │   └── page.tsx         # Direct messages
│   │   ├── shop/
│   │   │   └── page.tsx         # Currency shop
│   │   ├── leaderboard/
│   │   │   └── page.tsx         # Community rankings
│   │   └── settings/
│   │       └── page.tsx         # Account settings
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── route.ts         # Authentication endpoints
│   │   ├── posts/
│   │   │   └── route.ts         # Posts CRUD
│   │   ├── skills/
│   │   │   └── route.ts         # Skills CRUD
│   │   ├── offers/
│   │   │   └── route.ts         # Skill offers CRUD
│   │   ├── clubs/
│   │   │   ├── route.ts         # Clubs CRUD
│   │   │   └── [id]/
│   │   │       ├── members/
│   │   │       │   └── route.ts # Club membership
│   │   │       └── events/
│   │   │           └── route.ts # Club events
│   │   ├── messages/
│   │   │   └── route.ts         # Messages CRUD
│   │   ├── currency/
│   │   │   ├── wallets/
│   │   │   │   └── route.ts     # Currency wallets
│   │   │   └── purchase/
│   │   │       └── route.ts     # Shop purchases
│   │   ├── reports/
│   │   │   └── route.ts         # User reports
│   │   └── notifications/
│   │       └── route.ts         # Notifications
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── toaster.tsx
│   │   └── dropdown-menu.tsx
│   ├── auth/                    # Authentication components
│   │   ├── sign-in-form.tsx
│   │   └── sign-up-form.tsx
│   ├── profile/                 # Profile components
│   │   └── profile-form.tsx
│   ├── feed/                    # Feed components
│   │   └── feed-component.tsx
│   ├── skills/                  # Skills components
│   │   └── skills-component.tsx
│   ├── offers/                  # Offers components
│   │   └── offers-component.tsx
│   ├── clubs/                   # Clubs components
│   │   ├── clubs-component.tsx
│   │   └── club-detail-component.tsx
│   ├── messages/                # Messages components
│   │   └── messages-component.tsx
│   ├── shop/                    # Shop components
│   │   └── shop-component.tsx
│   ├── leaderboard/             # Leaderboard components
│   │   └── leaderboard-component.tsx
│   ├── settings/                # Settings components
│   │   └── settings-component.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── dashboard-nav.tsx
│   │   └── dashboard-sidebar.tsx
│   └── theme-provider.tsx       # Theme provider
├── lib/                         # Utility libraries
│   ├── supabase/                # Supabase clients
│   │   ├── server.ts            # Server-side client
│   │   └── client.ts            # Client-side client
│   ├── auth.ts                  # Authentication utilities
│   ├── i18n.ts                  # Internationalization
│   ├── validators.ts            # Zod validation schemas
│   ├── safety.ts                # Content safety utilities
│   ├── geo.ts                   # Geolocation utilities
│   └── types.ts                 # Database types
├── hooks/                       # Custom React hooks
│   ├── use-locale.ts            # Locale management
│   ├── use-auth.ts              # Authentication state
│   └── use-api.ts               # API utilities
├── store/                       # Zustand stores
│   ├── auth-store.ts            # Authentication state
│   ├── ui-store.ts              # UI state (theme, sidebar)
│   └── notifications-store.ts   # Notifications state
├── types/                       # TypeScript types
│   └── index.ts                 # Common interfaces
└── styles/                      # CSS styles
    └── components.css           # Component-specific styles
```

## Route Groups

### (public) - Public Routes
- **Purpose**: Pages accessible to unauthenticated users
- **Layout**: Redirects authenticated users to dashboard
- **Pages**: Sign-in, Sign-up, Landing page

### (auth) - Authenticated User Routes
- **Purpose**: Pages for authenticated users (profile management)
- **Layout**: Redirects unauthenticated users to sign-in
- **Pages**: Profile management

### (main) - Main Application Routes
- **Purpose**: Core application functionality
- **Layout**: Includes navigation and sidebar
- **Pages**: Feed, Skills, Offers, Clubs, Messages, Shop, Leaderboard, Settings

## API Routes

### Authentication
- `POST /api/auth` - Sign in with email/password
- `DELETE /api/auth` - Sign out

### Content Management
- `GET/POST /api/posts` - Posts CRUD
- `GET/POST /api/skills` - Skills CRUD
- `GET/POST /api/offers` - Skill offers CRUD
- `GET/POST /api/clubs` - Clubs CRUD
- `GET/POST /api/clubs/[id]/members` - Club membership
- `GET/POST /api/clubs/[id]/events` - Club events

### Communication
- `GET/POST /api/messages` - Direct messages

### Economy
- `GET/POST /api/currency/wallets` - Currency wallets
- `POST /api/currency/purchase` - Shop purchases

### Moderation
- `GET/POST /api/reports` - User reports
- `GET/PATCH /api/notifications` - Notifications

## Key Features

### Authentication
- Email/password authentication
- OAuth (Google, GitHub)
- Protected routes with middleware
- Session management

### Internationalization (i18n)
- Support for English (en) and Russian (ru)
- Locale stored in cookies
- Translation dictionaries
- `useLocale` hook for language switching

### State Management
- **Zustand**: Global state management
- **React Query**: Server state management
- **React Hook Form**: Form state management

### UI/UX
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Reusable components
- **Dark/Light mode**: Theme switching
- **Responsive design**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation

### Form Handling
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation
- **Controlled components**: Type-safe forms

### Content Safety
- Basic profanity filter
- AI-powered content moderation (stub)
- Rate limiting
- User reporting system

### Geolocation
- Haversine formula for distance calculations
- Bounding box queries
- Location-based matching
- Privacy controls

## Development Guidelines

### TypeScript
- Strict type checking enabled
- Path aliases configured (`@/*`, `@/components/*`, etc.)
- Database types generated from Supabase

### Code Organization
- Feature-based component organization
- Shared utilities in `/lib`
- Custom hooks in `/hooks`
- Global state in `/store`

### Performance
- Server components where possible
- Client components only when needed
- Image optimization with Next.js
- Code splitting by route

### Security
- Row Level Security (RLS) policies
- Input validation with Zod
- Content sanitization
- Rate limiting

## Next Steps

1. **Component Implementation**: Replace placeholder components with full functionality
2. **Database Integration**: Connect components to Supabase API
3. **Real-time Features**: Add WebSocket connections for messages and notifications
4. **Testing**: Add unit and integration tests
5. **Deployment**: Configure Vercel deployment
6. **Monitoring**: Add error tracking and analytics

## Dependencies

### Core
- Next.js 15 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS
- shadcn/ui

### State Management
- Zustand
- @tanstack/react-query
- React Hook Form

### Authentication & Database
- Supabase (PostgreSQL, Auth, Storage)
- @supabase/ssr
- @supabase/supabase-js

### Utilities
- Zod (validation)
- Lucide React (icons)
- Sonner (toasts)
- next-themes (theme switching)

### Development
- ESLint
- Prettier
- Playwright (E2E testing)
- Jest (unit testing)
