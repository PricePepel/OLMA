# OLMA API Contracts Documentation

This document provides comprehensive documentation for all API endpoints in the OLMA MVP, including request/response formats, validation rules, and usage examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Common Response Formats](#common-response-formats)
3. [Error Handling](#error-handling)
4. [Posts API](#posts-api)
5. [Offers API](#offers-api)
6. [Conversations API](#conversations-api)
7. [Messages API](#messages-api)
8. [Clubs API](#clubs-api)
9. [Club Events API](#club-events-api)
10. [Currency API](#currency-api)
11. [Reports API](#reports-api)
12. [Leaderboard API](#leaderboard-api)

## Authentication

All API endpoints require authentication via Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Common Response Formats

### Success Response
```typescript
{
  "data": <response_data>,
  "message": "Optional success message"
}
```

### Paginated Response
```typescript
{
  "data": <array_of_items>,
  "total": <total_count>,
  "page": <current_page>,
  "limit": <items_per_page>,
  "hasMore": <boolean>,
  "cursor": <next_cursor>
}
```

### Error Response
```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": <optional_additional_info>
  }
}
```

## Error Handling

### Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Rate limit exceeded
- `INSUFFICIENT_FUNDS`: Not enough currency
- `CONTENT_VIOLATION`: Content violates guidelines
- `DUPLICATE_ENTRY`: Resource already exists
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## Posts API

### GET /api/posts
Fetch paginated posts with optional filtering.

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor
- `q` (string, optional): Search query
- `limit` (number, optional): Items per page (default: 20, max: 50)
- `clubId` (string, optional): Filter by club ID

**Response:**
```typescript
{
  "data": {
    "data": [
      {
        "id": "uuid",
        "content": "Post content",
        "created_at": "2024-01-01T00:00:00Z",
        "author": {
          "id": "uuid",
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "https://...",
          "rating": 4.5
        },
        "club": {
          "id": "uuid",
          "name": "Club Name",
          "description": "Club description"
        },
        "media": [
          {
            "id": "uuid",
            "media_url": "https://..."
          }
        ],
        "_count": {
          "likes": 10,
          "comments": 5
        }
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "cursor": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/posts
Create a new post.

**Request Body:**
```typescript
{
  "content": "Post content (1-1000 chars)",
  "clubId": "uuid (optional)",
  "mediaUrls": ["https://..."] (optional)
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "content": "Post content",
    "created_at": "2024-01-01T00:00:00Z",
    "author": {
      "id": "uuid",
      "full_name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://...",
      "rating": 4.5
    },
    "media": [],
    "_count": {
      "likes": 0,
      "comments": 0
    }
  },
  "message": "Post created successfully"
}
```

## Offers API

### GET /api/offers
Fetch skill offers with optional filtering and geo-based search.

**Query Parameters:**
- `skillId` (string, optional): Filter by skill ID
- `offerType` (string, optional): "teach" or "learn"
- `near` (string, optional): "lat,lng" format for geo search
- `radiusKm` (number, optional): Search radius in km (default: 10, max: 100)
- `cursor` (string, optional): Pagination cursor
- `limit` (number, optional): Items per page (default: 20, max: 50)

**Response:**
```typescript
{
  "data": {
    "data": [
      {
        "id": "uuid",
        "offer_type": "teach",
        "description": "I can teach JavaScript",
        "price": 50,
        "created_at": "2024-01-01T00:00:00Z",
        "distance": 2.5, // km, if geo search used
        "skill": {
          "id": "uuid",
          "name": "JavaScript",
          "description": "Programming language",
          "category": "Programming",
          "difficulty_level": 2
        },
        "author": {
          "id": "uuid",
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "https://...",
          "rating": 4.5,
          "latitude": 37.7749,
          "longitude": -122.4194
        }
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "cursor": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/offers
Create a new skill offer.

**Request Body:**
```typescript
{
  "skillId": "uuid",
  "offerType": "teach" | "learn",
  "description": "Offer description (10-500 chars)",
  "price": 50 (optional, number),
  "availability": {} (optional, JSON object),
  "geoOptIn": true (optional, boolean)
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "offer_type": "teach",
    "description": "I can teach JavaScript",
    "price": 50,
    "created_at": "2024-01-01T00:00:00Z",
    "skill": {
      "id": "uuid",
      "name": "JavaScript",
      "description": "Programming language",
      "category": "Programming",
      "difficulty_level": 2
    },
    "author": {
      "id": "uuid",
      "full_name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://...",
      "rating": 4.5,
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "message": "Skill offer created successfully"
}
```

## Conversations API

### GET /api/conversations
Fetch user's conversations.

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "participants": [
        {
          "id": "uuid",
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "https://..."
        }
      ],
      "lastMessage": {
        "id": "uuid",
        "content": "Hello!",
        "created_at": "2024-01-01T00:00:00Z",
        "author": {
          "id": "uuid",
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "https://..."
        }
      },
      "unreadCount": 2
    }
  ]
}
```

### POST /api/conversations
Create or get existing conversation with a participant.

**Request Body:**
```typescript
{
  "participantId": "uuid"
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "participants": [
      {
        "id": "uuid",
        "full_name": "John Doe",
        "username": "johndoe",
        "avatar_url": "https://..."
      }
    ],
    "unreadCount": 0
  },
  "message": "Conversation created successfully"
}
```

## Messages API

### GET /api/messages
Fetch messages in a conversation.

**Query Parameters:**
- `conversationId` (string, required): Conversation ID
- `cursor` (string, optional): Pagination cursor
- `limit` (number, optional): Items per page (default: 20)

**Response:**
```typescript
{
  "data": {
    "data": [
      {
        "id": "uuid",
        "content": "Hello!",
        "created_at": "2024-01-01T00:00:00Z",
        "read": true,
        "author": {
          "id": "uuid",
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "https://..."
        }
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "cursor": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/messages
Send a message in a conversation.

**Request Body:**
```typescript
{
  "conversationId": "uuid",
  "content": "Message content (1-1000 chars)"
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "content": "Hello!",
    "created_at": "2024-01-01T00:00:00Z",
    "read": false,
    "author": {
      "id": "uuid",
      "full_name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://..."
    }
  },
  "message": "Message sent successfully"
}
```

## Clubs API

### GET /api/clubs
Fetch all clubs with member information.

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "name": "Club Name",
      "description": "Club description",
      "banner_url": "https://...",
      "is_private": false,
      "created_at": "2024-01-01T00:00:00Z",
      "_count": {
        "members": 25,
        "events": 5
      },
      "owner": {
        "id": "uuid",
        "full_name": "John Doe",
        "username": "johndoe",
        "avatar_url": "https://..."
      },
      "isMember": true,
      "userRole": "member"
    }
  ]
}
```

### POST /api/clubs
Create a new club.

**Request Body:**
```typescript
{
  "name": "Club Name (2-100 chars)",
  "description": "Club description (10-500 chars)",
  "bannerUrl": "https://..." (optional),
  "isPrivate": false (optional)
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "name": "Club Name",
    "description": "Club description",
    "banner_url": "https://...",
    "is_private": false,
    "created_at": "2024-01-01T00:00:00Z",
    "_count": {
      "members": 1,
      "events": 0
    },
    "owner": {
      "id": "uuid",
      "full_name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://..."
    },
    "isMember": true,
    "userRole": "owner"
  },
  "message": "Club created successfully"
}
```

## Club Events API

### GET /api/clubs/[id]/events
Fetch events for a specific club.

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "title": "Event Title",
      "description": "Event description",
      "datetime_start": "2024-01-01T18:00:00Z",
      "datetime_end": "2024-01-01T20:00:00Z",
      "max_attendees": 50,
      "status": "published",
      "club": {
        "id": "uuid",
        "name": "Club Name",
        "description": "Club description",
        "banner_url": "https://..."
      },
      "location": {
        "id": "uuid",
        "address_text": "123 Main St, City",
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "attendees": [
        {
          "id": "uuid",
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "https://..."
        }
      ],
      "_count": {
        "attendees": 15
      },
      "isAttending": true
    }
  ]
}
```

### POST /api/clubs/[id]/events
Create a new event for a club (requires owner/moderator permissions).

**Request Body:**
```typescript
{
  "title": "Event Title (2-100 chars)",
  "description": "Event description (10-500 chars)",
  "datetimeStart": "2024-01-01T18:00:00Z",
  "datetimeEnd": "2024-01-01T20:00:00Z",
  "locationId": "uuid" (optional),
  "maxAttendees": 50 (optional)
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "title": "Event Title",
    "description": "Event description",
    "datetime_start": "2024-01-01T18:00:00Z",
    "datetime_end": "2024-01-01T20:00:00Z",
    "max_attendees": 50,
    "status": "published",
    "club": {
      "id": "uuid",
      "name": "Club Name",
      "description": "Club description",
      "banner_url": "https://..."
    },
    "location": {
      "id": "uuid",
      "address_text": "123 Main St, City",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "attendees": [],
    "_count": {
      "attendees": 0
    },
    "isAttending": false
  },
  "message": "Event created successfully"
}
```

## Currency API

### POST /api/currency/purchase
Purchase an item from the shop.

**Request Body:**
```typescript
{
  "itemId": "uuid",
  "quantity": 1 (optional, default: 1)
}
```

**Response:**
```typescript
{
  "data": {
    "purchase": {
      "id": "uuid",
      "item": {
        "id": "uuid",
        "name": "Item Name",
        "description": "Item description",
        "price": 100,
        "currency_type": "personal",
        "item_type": "cosmetic"
      },
      "quantity": 1,
      "total_price": 100
    },
    "updatedWallet": {
      "id": "uuid",
      "currency_type": "personal",
      "balance": 150,
      "recentTransactions": [
        {
          "id": "uuid",
          "delta": -100,
          "reason": "Purchase: Item Name x1",
          "created_at": "2024-01-01T00:00:00Z"
        }
      ]
    }
  },
  "message": "Purchase completed successfully"
}
```

## Reports API

### GET /api/reports
Fetch reports (user's own reports or all reports for admins).

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "target_type": "post",
      "target_id": "uuid",
      "report_type": "inappropriate",
      "reason": "Report reason",
      "description": "Additional details",
      "status": "open",
      "created_at": "2024-01-01T00:00:00Z",
      "reporter": {
        "id": "uuid",
        "full_name": "John Doe",
        "username": "johndoe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### POST /api/reports
Submit a new report.

**Request Body:**
```typescript
{
  "targetType": "post" | "profile" | "message" | "club" | "offer",
  "targetId": "uuid",
  "reportType": "spam" | "inappropriate" | "harassment" | "fake" | "other",
  "reason": "Report reason (10-500 chars)",
  "description": "Additional details (optional, max 1000 chars)"
}
```

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "target_type": "post",
    "target_id": "uuid",
    "report_type": "inappropriate",
    "reason": "Report reason",
    "description": "Additional details",
    "status": "open",
    "created_at": "2024-01-01T00:00:00Z",
    "reporter": {
      "id": "uuid",
      "full_name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://..."
    }
  },
  "message": "Report submitted successfully"
}
```

## Leaderboard API

### GET /api/leaderboard
Fetch leaderboard rankings.

**Query Parameters:**
- `period` (string, optional): "week", "month", or "all" (default: "week")
- `category` (string, optional): "experience", "currency", "achievements", or "streak" (default: "experience")
- `limit` (number, optional): Number of entries (default: 20, max: 100)

**Response:**
```typescript
{
  "data": [
    {
      "rank": 1,
      "profile": {
        "id": "uuid",
        "full_name": "John Doe",
        "username": "johndoe",
        "avatar_url": "https://...",
        "experience_points": 1500,
        "level": 5,
        "rating": 4.8
      },
      "score": 1500,
      "category": "experience",
      "period": "week"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Posts**: 5 posts per minute
- **Offers**: 3 offers per 5 minutes
- **Conversations**: 10 conversations per minute
- **Messages**: 20 messages per minute
- **Clubs**: 2 clubs per 5 minutes
- **Events**: 5 events per 5 minutes
- **Purchases**: 10 purchases per minute
- **Reports**: 5 reports per 5 minutes

When rate limited, the API returns a 429 status code with the `RATE_LIMITED` error code.

## Content Safety

All user-generated content (posts, messages, offers) is automatically checked for:
- Profanity and inappropriate language
- Spam patterns
- Community guideline violations

Content that violates guidelines is rejected with a `CONTENT_VIOLATION` error.

## Geo-based Features

The offers API supports location-based search:
- Use the `near` parameter with "lat,lng" format
- Specify search radius with `radiusKm` parameter
- Results are sorted by distance when geo search is used
- Users must opt-in to geo features with `geoOptIn: true`

## Pagination

Most list endpoints support cursor-based pagination:
- Use `cursor` parameter for pagination
- Response includes `hasMore` boolean and next `cursor`
- Default limit is 20 items per page
- Maximum limit varies by endpoint (typically 50-100)

## Validation

All endpoints use Zod schemas for request validation:
- Required fields are enforced
- String length limits are applied
- UUID formats are validated
- Enum values are restricted to allowed options
- Invalid requests return `VALIDATION_ERROR` with details

## Security

- All endpoints require authentication
- RLS policies enforce data access control
- Users can only access their own data or public data
- Admins have elevated permissions for moderation
- Sensitive operations are rate-limited
- Content is sanitized and validated
