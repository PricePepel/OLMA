# OLMA Safety & Moderation System

This document provides comprehensive documentation for the Safety & Moderation system implemented in the OLMA MVP.

## Overview

The Safety & Moderation system provides comprehensive content filtering, user reporting, and administrative moderation capabilities to ensure a safe and respectful community environment.

## Features

### 1. Content Safety Filter (`safetyFilter`)

The core safety filter combines multiple detection methods:

#### Profanity Detection
- **English profanity list**: Comprehensive list of inappropriate English words
- **Russian profanity list**: Cyrillic profanity detection for Russian content
- **Language auto-detection**: Automatically detects content language using Cyrillic character ratio

#### PII (Personally Identifiable Information) Detection
- Phone numbers (US, Russian, Belarus formats)
- Email addresses
- Credit card numbers (basic pattern)
- Social Security Numbers (US)
- Passport numbers (US, Russian)
- IP addresses
- Physical addresses

#### Inappropriate Content Detection
- Spam indicators (spam, scam, fake, phishing, virus, malware)
- Illegal content (hack, crack, warez, drugs, weapons)
- Hate speech indicators (kill, murder, suicide, racist, nazi)
- Sexual content (sex, porn, nude, adult)
- Threats (threat, kill you, hurt you, attack)
- Russian inappropriate patterns (наркотики, оружие, терроризм)

#### Suspicious Link Detection
- Shortened URLs (bit.ly, tinyurl, goo.gl, t.co)
- Suspicious domains (.xyz, .top, .site, .online, .click, .link)

#### Spam Indicators
- Excessive capitalization (>70% caps in content >20 chars)
- Repeated characters (5+ consecutive same characters)
- Suspicious link patterns

#### AI-Powered Moderation (Optional)
- OpenAI API integration for advanced content analysis
- Detects hate speech, violence, sexual content, self-harm
- Falls back to basic filtering if API key not available

### 2. Report System

#### Report Button Component
- **Location**: `src/components/reports/report-button.tsx`
- **Usage**: Can be added to posts, messages, and profiles
- **Features**:
  - Dropdown menu with predefined report reasons
  - Different reasons for different content types
  - Automatic API submission
  - Toast notifications for feedback

#### Report Reasons by Content Type

**Posts:**
- Spam or misleading content
- Harassment or bullying
- Inappropriate content
- False information
- Copyright violation
- Other

**Messages:**
- Harassment or bullying
- Spam or unwanted content
- Inappropriate content
- Threats or violence
- Other

**Profiles:**
- Fake account
- Harassment or bullying
- Inappropriate content
- Impersonation
- Other

### 3. Admin Moderation Dashboard

#### Location
- **Page**: `/settings/moderation`
- **Component**: `src/components/moderation/moderation-dashboard.tsx`

#### Features

**Statistics Overview:**
- Total reports count
- Open reports count
- Resolution rate
- Banned users count
- Hidden content count

**Reports Management:**
- View all reports in table format
- Filter by status (open, review, resolved, rejected)
- View report details in modal
- Take action on reports

**Quick Actions:**
- Resolve report
- Reject report
- Hide content
- Ban user
- Soft ban (temporary restrictions)

**Custom Actions:**
- Apply moderation to any content/user by ID
- Select action type (warn, hide, delete, soft_ban, ban, restrict)
- Set duration for temporary actions
- Add custom reason

**Analytics:**
- Reports by type (pie chart)
- Reports by status (bar chart)
- Reports timeline (last 30 days)
- Resolution rate trends

### 4. API Endpoints

#### Reports API
- **GET** `/api/reports` - Fetch reports (admin sees all, users see own)
- **POST** `/api/reports` - Submit new report
- **PATCH** `/api/reports/[id]` - Update report status and take actions

#### Moderation Stats API
- **GET** `/api/moderation/stats` - Fetch moderation statistics (admin only)

#### Content Safety Integration
- **POST** `/api/posts` - Automatically applies safety filter to new posts
- **POST** `/api/messages` - Automatically applies safety filter to new messages

### 5. Moderation Actions

#### Content Actions
- **Hide Content**: Sets `is_hidden` flag on posts/messages, changes profile visibility to private
- **Delete Content**: Permanently removes content from database
- **Warn User**: Sends warning notification (stub implementation)

#### User Actions
- **Soft Ban**: Temporary restrictions (24 hours by default)
- **Permanent Ban**: Sets `is_banned` flag and records ban reason
- **Restrict User**: Limits user capabilities temporarily

#### Report Actions
- **Resolve**: Marks report as resolved
- **Reject**: Marks report as rejected
- **Review**: Marks report for manual review

### 6. Database Schema

#### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL, -- 'post', 'message', 'profile'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT
);
```

#### Profile Moderation Fields
```sql
-- Added to profiles table
is_banned BOOLEAN DEFAULT false,
banned_at TIMESTAMPTZ,
ban_reason TEXT,
is_restricted BOOLEAN DEFAULT false,
restriction_end TIMESTAMPTZ,
restriction_reason TEXT
```

#### Content Moderation Fields
```sql
-- Added to posts and messages tables
is_hidden BOOLEAN DEFAULT false
```

### 7. Logging

#### Moderation Action Logging
- All moderation actions are logged to server console
- Includes timestamp, action type, user ID, content ID, and reason
- Structured JSON format for easy parsing
- Can be extended to send to external logging services

#### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "action": "ban_user",
  "userId": "user-uuid",
  "contentId": "content-uuid",
  "reason": "Violation of community guidelines",
  "contentPreview": "Content preview..."
}
```

### 8. Configuration

#### Environment Variables
```env
# OpenAI API for AI-powered moderation (optional)
OPENAI_API_KEY=your_openai_api_key

# Safety filter options
SAFETY_CHECK_PII=true
SAFETY_USE_AI=false
SAFETY_LANGUAGE=auto
```

#### Safety Filter Options
```typescript
interface SafetyFilterOptions {
  checkPII?: boolean;        // Enable PII detection
  useAI?: boolean;           // Enable OpenAI moderation
  language?: 'en' | 'ru' | 'auto'; // Force language or auto-detect
}
```

### 9. Usage Examples

#### Adding Report Button to Post Component
```tsx
import { ReportButton } from '@/components/reports/report-button'

function PostComponent({ post }) {
  return (
    <div>
      <p>{post.content}</p>
      <ReportButton 
        targetType="post" 
        targetId={post.id}
        variant="ghost"
        size="sm"
      />
    </div>
  )
}
```

#### Using Safety Filter in API Route
```typescript
import { safetyFilter } from '@/lib/safety'

export async function POST(request: Request) {
  const { content } = await request.json()
  
  const safetyResult = await safetyFilter(content, {
    checkPII: true,
    useAI: !!process.env.OPENAI_API_KEY,
    language: 'auto'
  })
  
  if (!safetyResult.isSafe) {
    return new Response('Content violates guidelines', { status: 400 })
  }
  
  // Continue with content creation
}
```

#### Admin Access Check
```typescript
// Check if user is admin before allowing moderation actions
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single()

if (!profile?.is_admin) {
  return createErrorResponse('Admin access required', ApiErrorCode.FORBIDDEN)
}
```

### 10. Security Considerations

#### Access Control
- Only admins can access moderation dashboard
- Users can only see their own reports
- RLS policies enforce data access restrictions

#### Rate Limiting
- Report submission limited to 5 reports per 5 minutes per user
- Content creation rate limited to prevent spam

#### Content Sanitization
- HTML entities escaped to prevent XSS
- Input validation using Zod schemas
- SQL injection prevention via parameterized queries

### 11. Future Enhancements

#### Planned Features
- **Machine Learning**: Train custom models for better content detection
- **Community Moderation**: Allow trusted users to moderate content
- **Appeal System**: Allow users to appeal moderation decisions
- **Automated Actions**: Trigger actions based on user history
- **Content Scoring**: Implement reputation system for users
- **Real-time Monitoring**: Live dashboard for active moderation
- **Integration**: Connect with external moderation services

#### Scalability Considerations
- **Redis Caching**: Cache safety check results
- **Queue System**: Process moderation actions asynchronously
- **CDN Integration**: Cache static moderation assets
- **Database Optimization**: Indexes for report queries
- **API Rate Limiting**: Prevent abuse of moderation endpoints

## Conclusion

The Safety & Moderation system provides a comprehensive solution for maintaining community standards in the OLMA platform. It combines automated content filtering with human oversight, ensuring both efficiency and accuracy in moderation decisions.

The system is designed to be extensible and can be enhanced with additional features as the platform grows. All components are built with TypeScript for type safety and follow React best practices for maintainability.
