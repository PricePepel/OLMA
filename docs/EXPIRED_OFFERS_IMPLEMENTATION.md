# Expired Offers Implementation

## Overview

This implementation automatically changes the status of meeting invitations from "pending" to "denied" when the proposed meeting date has passed and the invitee hasn't responded yet.

## Features

### 1. Automatic Expiration
- Meeting invitations with status "pending" are automatically changed to "denied" when their `meeting_date` is in the past
- This prevents outdated offers from cluttering the system
- Maintains clean data and improves user experience

### 2. Multiple Execution Methods
- **Real-time**: Automatically checked when users view their offers
- **Scheduled**: Runs every hour via Vercel cron job
- **Manual**: Can be triggered manually via API endpoint

### 3. Database Functions
- Optimized database functions for efficient bulk operations
- Proper indexing for fast queries on date and status
- Fallback mechanisms for reliability

## Implementation Details

### Database Schema

The system works with the `meeting_invitations` table:
```sql
CREATE TABLE meeting_invitations (
  id UUID PRIMARY KEY,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  -- ... other fields
);
```

### API Endpoints

#### 1. `/api/offers/expire` (POST)
- **Purpose**: Expire all outdated meeting invitations
- **Authentication**: Required
- **Response**: JSON with count of expired offers and details

#### 2. `/api/offers/expire` (GET)
- **Purpose**: Check for expired offers without updating them
- **Authentication**: Required
- **Response**: JSON with list of expired offers (for monitoring)

#### 3. `/api/offers` (GET)
- **Enhanced**: Now automatically expires offers before returning results
- **Benefit**: Users always see up-to-date offer statuses

### Database Functions

#### `expire_outdated_meeting_invitations()`
- Finds all pending invitations past their meeting date
- Updates them to 'denied' status
- Returns count and IDs of expired invitations

#### `check_and_expire_offers()`
- Wrapper function that calls the expiration function
- Returns JSON response suitable for API consumption
- Includes timestamp and detailed results

### Cron Job Configuration

**Vercel Configuration** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/offers/expire",
      "schedule": "0 * * * *"
    }
  ]
}
```

- **Schedule**: Every hour at minute 0 (`0 * * * *`)
- **Purpose**: Ensures offers are expired even if users don't access the system

## Usage Examples

### Manual Expiration Check
```bash
# Check for expired offers (read-only)
curl -X GET /api/offers/expire

# Expire outdated offers
curl -X POST /api/offers/expire
```

### Database Function Usage
```sql
-- Check for expired offers without updating
SELECT * FROM meeting_invitations 
WHERE status = 'pending' AND meeting_date < NOW();

-- Manually expire offers
SELECT check_and_expire_offers();
```

## UI Integration

### Status Handling
The offers UI already supports the "denied" status:
- **Color**: Red badge (`bg-red-100 text-red-800`)
- **Text**: "Denied"
- **Behavior**: No action buttons (read-only)

### User Experience
- Expired offers automatically disappear from "Pending" tab
- Appear in "Denied" tab for reference
- Clear visual indication of status change
- No manual intervention required

## Performance Optimizations

### Database Indexes
```sql
CREATE INDEX idx_meeting_invitations_date_status 
ON meeting_invitations(meeting_date, status) 
WHERE status = 'pending';
```

### Efficient Queries
- Uses database functions for bulk operations
- Optimized WHERE clauses with proper indexing
- Minimal data transfer with selective field queries

## Error Handling

### Fallback Mechanisms
- If database function fails, falls back to manual SQL queries
- Graceful error handling with proper HTTP status codes
- Logging for monitoring and debugging

### Error Types
- **Database Errors**: Connection or query failures
- **Authentication Errors**: Unauthorized access attempts
- **Validation Errors**: Invalid parameters or data

## Monitoring and Logging

### Log Points
- Expiration check execution
- Number of offers expired
- Error conditions and fallbacks
- Performance metrics

### Monitoring Endpoints
- GET `/api/offers/expire` for status checks
- Database function results for analytics
- Cron job execution logs in Vercel

## Testing

### Manual Testing
1. Create a meeting invitation with past date
2. Verify it shows as "pending" initially
3. Call expiration API or wait for cron job
4. Confirm status changes to "denied"

### Automated Testing
- Unit tests for API endpoints
- Integration tests for database functions
- End-to-end tests for UI behavior

## Deployment

### Prerequisites
1. Apply database migration: `expire_offers_function.sql`
2. Deploy updated API endpoints
3. Configure Vercel cron job
4. Test functionality in staging environment

### Rollback Plan
- Remove cron job configuration
- Revert API endpoint changes
- Database functions can remain (non-destructive)

## Future Enhancements

### Potential Improvements
1. **Configurable Expiration Time**: Allow different expiration periods
2. **Notification System**: Notify users when offers expire
3. **Analytics**: Track expiration patterns and user behavior
4. **Bulk Operations**: Admin interface for managing expired offers
5. **Custom Rules**: Different expiration rules for different offer types

### Scalability Considerations
- Database partitioning for large datasets
- Caching for frequently accessed data
- Rate limiting for API endpoints
- Monitoring for performance bottlenecks
