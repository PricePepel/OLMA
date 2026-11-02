# Vercel Deployment Guide for OLMA MVP

## ✅ Pre-Deployment Checklist

### 1. Build Status
- ✅ **Build Successful**: `npm run build` completes without errors
- ✅ **TypeScript**: All type errors resolved
- ✅ **Dependencies**: All packages properly installed
- ✅ **Next.js 15**: Compatible with Vercel platform

### 2. Configuration Files
- ✅ **vercel.json**: Configured with cron jobs for expired offers
- ✅ **next.config.js**: Optimized for production with security headers
- ✅ **package.json**: Proper build scripts and dependencies
- ✅ **middleware.ts**: Security headers and Edge Runtime compatible

### 3. API Routes
- ✅ **All API endpoints**: Functioning correctly
- ✅ **Authentication**: Supabase auth integration
- ✅ **Database**: Supabase database connections
- ✅ **Cron Jobs**: Automated offer expiration system

## 🚀 Deployment Steps

### 1. Prepare Environment Variables

Set these environment variables in Vercel dashboard:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth.js Configuration (Required)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key

# App Configuration (Required)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=OLMA

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security (Recommended)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 3. Configure Vercel Settings

#### Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

#### Environment Variables
- Add all required environment variables
- Set `NEXTAUTH_URL` to your Vercel domain
- Ensure Supabase keys are correctly configured

#### Cron Jobs
- ✅ **Automatically configured** via `vercel.json`
- **Path**: `/api/offers/expire`
- **Schedule**: `0 * * * *` (every hour)

## 🔧 Post-Deployment Configuration

### 1. Supabase Configuration
```sql
-- Apply the comprehensive skills SQL script
-- Run: add_comprehensive_skills.sql

-- Apply the expired offers function
-- Run: expire_offers_function.sql (if not already applied)
```

### 2. Domain Configuration
- Set up custom domain in Vercel dashboard
- Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to match your domain
- Configure SSL certificate (automatic with Vercel)

### 3. OAuth Provider Configuration
Update OAuth provider settings:
- **Google OAuth**: Add Vercel domain to authorized origins
- **GitHub OAuth**: Update callback URLs
- **Supabase Auth**: Configure site URL in Supabase dashboard

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance and usage

### 2. Error Monitoring
- Check Vercel function logs
- Monitor API route performance
- Set up error alerts

### 3. Database Monitoring
- Monitor Supabase usage
- Check database performance
- Set up alerts for high usage

## 🛡️ Security Considerations

### 1. Environment Variables
- ✅ All sensitive data in environment variables
- ✅ No hardcoded secrets in code
- ✅ Proper key rotation strategy

### 2. Headers & Security
- ✅ Security headers configured in `next.config.js`
- ✅ Middleware adds additional security headers
- ✅ CORS properly configured

### 3. Authentication
- ✅ Supabase RLS policies enabled
- ✅ Proper user authentication flow
- ✅ Protected API routes

## 🔄 Continuous Deployment

### 1. GitHub Integration
- Connect repository to Vercel
- Automatic deployments on push to main
- Preview deployments for pull requests

### 2. Environment Management
- Production environment for main branch
- Preview environments for feature branches
- Proper environment variable management

### 3. Database Migrations
- Apply SQL scripts manually in Supabase
- Consider automated migration strategy
- Backup before major changes

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

#### Environment Variable Issues
- Check all required variables are set
- Verify variable names match exactly
- Ensure no extra spaces or quotes

#### API Route Issues
- Check Supabase connection
- Verify authentication flow
- Monitor function logs in Vercel

#### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Monitor database logs

### Debugging Commands
```bash
# Check build locally
npm run build

# Test API routes locally
npm run dev

# Check types
npm run type-check

# Lint code
npm run lint
```

## 📈 Performance Optimization

### 1. Vercel Optimizations
- ✅ Edge Runtime for middleware
- ✅ Static generation where possible
- ✅ Image optimization enabled

### 2. Database Optimizations
- ✅ Proper indexing on frequently queried fields
- ✅ Efficient queries with proper joins
- ✅ Connection pooling with Supabase

### 3. Caching Strategy
- Consider implementing Redis for caching
- Use Vercel's edge caching
- Implement proper cache headers

## 🎯 Success Metrics

### Deployment Success Indicators
- ✅ Build completes without errors
- ✅ All API routes respond correctly
- ✅ Authentication flow works
- ✅ Database connections established
- ✅ Cron jobs execute successfully
- ✅ All features functional

### Performance Targets
- **Build Time**: < 5 minutes
- **API Response**: < 200ms average
- **Page Load**: < 2 seconds
- **Uptime**: > 99.9%

## 📝 Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies
- Backup database
- Review performance metrics
- Update security patches

### Monthly Reviews
- Review usage statistics
- Optimize database queries
- Update environment variables
- Check for security vulnerabilities
- Plan feature updates

---

## 🎉 Ready for Deployment!

Your OLMA MVP is now ready for Vercel deployment with:
- ✅ Successful build
- ✅ Proper configuration
- ✅ Security measures
- ✅ Performance optimizations
- ✅ Monitoring setup

Deploy with confidence! 🚀
