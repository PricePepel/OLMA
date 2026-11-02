# User Activity System

## Overview

The User Activity System tracks and displays real-time user activities across the OLMA platform. Users can view their recent activities in their profile's Activity tab, providing a comprehensive timeline of their engagement with the platform.

## Features

### 1. Real-Time Activity Tracking
- **Messages**: Sent and received direct messages
- **Meeting Invitations**: All meeting-related activities (pending, accepted, denied, started, completed)
- **Skills**: Added skills for teaching or learning
- **Posts**: Created posts in clubs or general feed
- **Club Memberships**: Joined clubs with role information
- **Event Attendance**: Event registrations and attendance status

### 2. Visual Activity Feed
- **Color-coded Activities**: Different colors for different activity types
- **Icons**: Meaningful icons for each activity type
- **Timestamps**: Relative time display (e.g., "2 hours ago")
- **Metadata**: Additional context like club names, event titles, etc.

### 3. Comprehensive API
- **Unified Endpoint**: Single API endpoint for all user activities
- **Sorted Timeline**: Activities sorted by timestamp (most recent first)
- **Limited Results**: Configurable limits to prevent overwhelming UI
- **Error Handling**: Graceful fallbacks and error management

## Activity Types

### Message Activities
- **`message_sent`**: User sent a direct message
- **`message_received`**: User received a direct message
- **Icon**: MessageCircle
- **Color**: Blue (sent), Orange (received)

### Meeting Activities
- **`meeting_pending`**: Meeting invitation sent or received
- **`meeting_accepted`**: Meeting invitation accepted
- **`meeting_denied`**: Meeting invitation declined
- **`meeting_started`**: Meeting session started
- **`meeting_completed`**: Meeting session completed
- **Icon**: Calendar
- **Color**: Yellow (pending), Green (accepted/completed), Red (denied), Blue (started)

### Skill Activities
- **`skill_added`**: User added a new skill for teaching or learning
- **Icon**: Star
- **Color**: Purple

### Post Activities
- **`post_created`**: User created a new post
- **Icon**: MessageCircle
- **Color**: Blue

### Club Activities
- **`club_joined`**: User joined a club
- **Icon**: Building2
- **Color**: Purple

### Event Activities
- **`event_attended`**: User registered for or attended an event
- **Icon**: Calendar
- **Color**: Green

## API Endpoints

### GET `/api/dashboard/activity`
Returns a comprehensive list of user activities.

**Response Format:**
```json
[
  {
    "id": "activity-unique-id",
    "type": "activity_type",
    "title": "Activity Title",
    "description": "Activity description",
    "timestamp": "2024-01-15T10:30:00Z",
    "icon": "icon_name",
    "metadata": {
      "club_name": "Club Name",
      "event_title": "Event Title",
      "achievement_name": "Achievement Name",
      "points": 100
    }
  }
]
```

**Activity Sources:**
1. **Messages** (`messages` table)
2. **Meeting Invitations** (`meeting_invitations` table)
3. **User Skills** (`user_skills` table)
4. **Posts** (`posts` table)
5. **Club Memberships** (`club_members` table)
6. **Event Attendance** (`event_attendees` table)

## Database Schema Integration

### Tables Used
```sql
-- Messages
messages (id, content, sender_id, conversation_id, created_at)

-- Meeting Invitations
meeting_invitations (id, status, inviter_id, invitee_id, created_at)

-- User Skills
user_skills (id, user_id, skill_id, can_teach, can_learn, proficiency_level, created_at)

-- Posts
posts (id, user_id, club_id, content, created_at)

-- Club Memberships
club_members (id, user_id, club_id, role, joined_at)

-- Event Attendance
event_attendees (id, user_id, event_id, status, created_at)
```

### Relationships
- **Users**: Activities are filtered by authenticated user
- **Skills**: Skills table for skill names and details
- **Clubs**: Clubs table for club names and details
- **Events**: Events table for event titles and details
- **Conversations**: Messages linked through conversations

## UI Components

### ActivityComponent
- **Location**: `src/components/activity/activity-component.tsx`
- **Usage**: Used in profile page Activity tab
- **Features**:
  - Loading states with skeleton animations
  - Empty state with helpful messaging
  - Activity type icons and colors
  - Relative timestamp formatting
  - Metadata badges for additional context

### Profile Integration
- **Location**: `src/components/profile/profile-component.tsx`
- **Integration**: ActivityComponent embedded in Activity tab
- **User Experience**: Seamless integration with profile navigation

## Activity Display

### Visual Design
- **Card Layout**: Each activity in a bordered card
- **Icon + Color**: Meaningful visual indicators
- **Typography**: Clear hierarchy with titles and descriptions
- **Metadata**: Contextual badges for additional information
- **Timestamps**: Human-readable relative times

### Activity Formatting
```typescript
// Example activity display
{
  title: "Meeting invitation sent",
  description: "Guitar lessons with Sarah Johnson",
  timestamp: "2 hours ago",
  icon: "calendar",
  color: "yellow",
  metadata: {
    skill_name: "Guitar",
    other_user: "Sarah Johnson"
  }
}
```

## Performance Optimizations

### Database Queries
- **Selective Fields**: Only fetch necessary data
- **Limits**: Configurable limits per activity type
- **Indexes**: Proper indexing on user_id and created_at
- **Joins**: Efficient joins with related tables

### API Performance
- **Parallel Queries**: Multiple activity sources queried in parallel
- **Error Isolation**: Individual query failures don't break entire response
- **Caching**: Activity data can be cached for better performance
- **Pagination**: Support for pagination in future enhancements

## Error Handling

### API Level
- **Authentication**: Verify user authentication
- **Database Errors**: Graceful handling of query failures
- **Data Validation**: Ensure data integrity
- **Fallbacks**: Default values for missing data

### UI Level
- **Loading States**: Skeleton animations during data fetch
- **Error States**: User-friendly error messages
- **Empty States**: Helpful messaging when no activities exist
- **Retry Mechanisms**: Options to retry failed requests

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: WebSocket integration for live activity feeds
2. **Activity Filtering**: Filter by activity type or date range
3. **Activity Search**: Search through past activities
4. **Export Functionality**: Export activity history
5. **Activity Analytics**: Statistics and insights about user engagement
6. **Notification Integration**: Link activities to notification system
7. **Batch Operations**: Bulk activity operations for admins

### Scalability Considerations
- **Database Partitioning**: Partition activity tables by user or date
- **Caching Strategy**: Redis caching for frequently accessed activities
- **API Rate Limiting**: Prevent abuse of activity endpoints
- **Background Processing**: Async processing for activity generation

## Testing

### Manual Testing
1. **Create Activities**: Perform various actions (send messages, add skills, etc.)
2. **Verify Display**: Check activity appears in profile
3. **Test Timestamps**: Verify relative time formatting
4. **Test Metadata**: Check additional context is displayed
5. **Test Empty State**: Verify behavior when no activities exist

### Automated Testing
- **API Tests**: Test activity endpoint responses
- **Component Tests**: Test ActivityComponent rendering
- **Integration Tests**: Test full activity flow
- **Performance Tests**: Test with large activity datasets

## Security Considerations

### Data Privacy
- **User Isolation**: Users only see their own activities
- **Data Sanitization**: Sanitize user-generated content
- **Access Control**: Proper authentication and authorization
- **Audit Logging**: Log access to activity data

### Performance Security
- **Query Limits**: Prevent expensive database queries
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Validate all input parameters
- **SQL Injection**: Use parameterized queries

## Deployment

### Prerequisites
1. Database tables must exist with proper relationships
2. API endpoints must be deployed and accessible
3. UI components must be built and deployed
4. Authentication system must be functional

### Configuration
- **Activity Limits**: Configure how many activities to fetch per type
- **Cache Settings**: Configure caching for performance
- **Error Handling**: Configure error messages and fallbacks
- **UI Settings**: Configure activity display preferences
