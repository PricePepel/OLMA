# Deployment Guide

## Vercel Deployment Issues Fixed

This guide addresses the deployment issues you encountered with Vercel.

### Issues Fixed

1. **Missing Public Directory**: Updated Next.js configuration to use `output: 'standalone'` for proper Vercel deployment
2. **Supabase Environment Variables**: Added proper error handling and environment variable configuration
3. **Build Configuration**: Created proper `vercel.json` configuration

### Environment Variables Setup

You need to set up the following environment variables in your Vercel project:

#### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_production_url
NEXT_PUBLIC_APP_URL=your_production_url
```

#### Optional Variables
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
```

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate value
4. Make sure to set them for Production, Preview, and Development environments

### Local Development Setup

1. Copy `env.example` to `.env.local`
2. Fill in your actual values
3. Run `npm run dev`

### Build Configuration

The following files have been updated:

- `vercel.json`: Vercel deployment configuration
- `next.config.js`: Next.js configuration with standalone output
- `src/lib/supabase.ts`: Better error handling for missing environment variables

### Deployment Steps

1. Ensure all environment variables are set in Vercel
2. Push your changes to the main branch
3. Vercel will automatically deploy using the new configuration

### Troubleshooting

If you still encounter issues:

1. Check that all required environment variables are set
2. Verify your Supabase project is accessible
3. Check the Vercel build logs for specific error messages
4. Ensure your Supabase project has the correct CORS settings for your domain
