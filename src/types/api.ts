import { z } from 'zod'

// API Error Codes
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTENT_VIOLATION = 'CONTENT_VIOLATION',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
    cursor?: string | null
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  cursor?: string
}

// Validation Schemas
export const createPostSchema = z.object({
  content: z.string().min(1).max(1000),
  mediaUrls: z.array(z.string().url()).optional(),
  privacyLevel: z.enum(['public', 'club', 'private']).default('public'),
  clubId: z.string().uuid().optional(),
})

export const createClubSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  bannerUrl: z.string().url().optional(),
  isPrivate: z.boolean().default(false),
})

export const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().min(1).max(200),
  maxParticipants: z.number().min(1).max(1000),
  clubId: z.string().uuid(),
})

export const createSkillOfferSchema = z.object({
  skillName: z.string().min(1).max(100),
  offerType: z.enum(['teach', 'learn']),
  description: z.string().min(1).max(500),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const createOfferSchema = z.object({
  skillName: z.string().min(1).max(100),
  offerType: z.enum(['teach', 'learn']),
  description: z.string().min(1).max(500),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const getOffersSchema = z.object({
  skillId: z.string().optional(),
  offerType: z.enum(['teach', 'learn']).optional(),
  near: z.string().optional(),
  radiusKm: z.number().min(1).max(100).optional(),
})

export const createClubEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().min(1).max(200),
  maxParticipants: z.number().min(1).max(1000),
})

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().uuid()),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  conversationId: z.string().uuid(),
})

export const createLocationSchema = z.object({
  user_id: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address_text: z.string().optional(),
  privacy_level: z.enum(['public', 'club', 'private'])
})

export const createMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  conversationId: z.string().uuid(),
})

export const createReportSchema = z.object({
  target_type: z.enum(['post', 'user', 'club']),
  target_id: z.string().uuid(),
  reason: z.enum(['inappropriate_content', 'spam', 'harassment', 'fake_news', 'copyright', 'other']),
  description: z.string().optional(),
})

// Admin schemas
export const reportActionSchema = z.object({
  action: z.enum(['resolve', 'dismiss']),
  reason: z.string().optional(),
})

export const userRestrictionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['warning', 'mute', 'ban']),
  duration: z.number().optional(), // in minutes
})

export const purchaseItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().min(1).max(10),
})

// Request/Response Types
export interface CreatePostRequest {
  content: string
  mediaUrls?: string[]
  privacyLevel?: 'public' | 'club' | 'private'
  clubId?: string
}

export interface CreatePostResponse {
  id: string
  content: string
  mediaUrls: string[]
  privacyLevel: 'public' | 'club' | 'private'
  authorId: string
  clubId?: string
  createdAt: string
  updatedAt: string
}

// Post Types
export interface Post {
  id: string
  content: string
  mediaUrls: string[]
  privacyLevel: 'public' | 'club' | 'private'
  authorId: string
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateClubRequest {
  name: string
  description: string
  bannerUrl?: string
  isPrivate?: boolean
}

export interface CreateClubResponse {
  id: string
  name: string
  description: string
  bannerUrl?: string
  isPrivate: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventRequest {
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  maxParticipants: number
  clubId: string
}

export interface CreateEventResponse {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  clubId: string
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface CreateSkillOfferRequest {
  skillName: string
  offerType: 'teach' | 'learn'
  description: string
  location?: string
  latitude?: number
  longitude?: number
}

export interface CreateSkillOfferResponse {
  id: string
  skillName: string
  offerType: 'teach' | 'learn'
  description: string
  location?: string
  latitude?: number
  longitude?: number
  profileId: string
  createdAt: string
  updatedAt: string
}

export interface CreateMessageRequest {
  content: string
  conversationId: string
}

export interface CreateMessageResponse {
  id: string
  content: string
  conversationId: string
  senderId: string
  createdAt: string
  readAt?: string
}

export interface CreateReportRequest {
  targetType: 'post' | 'user' | 'club' | 'event'
  targetId: string
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other'
  description: string
}

export interface CreateReportResponse {
  id: string
  targetType: 'post' | 'user' | 'club' | 'event'
  targetId: string
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other'
  description: string
  reporterId: string
  status: 'open' | 'review' | 'resolved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface PurchaseItemRequest {
  itemId: string
  quantity: number
}

export interface PurchaseItemResponse {
  id: string
  itemId: string
  buyerId: string
  quantity: number
  totalCost: number
  currencyType: 'personal' | 'club'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

// User Profile Types
export interface UserProfile {
  id: string
  email: string
  fullName: string
  username: string
  avatarUrl?: string
  bio?: string
  location?: string
  latitude?: number
  longitude?: number
  timezone: string
  language: string
  experiencePoints: number
  personalCurrency: number
  level: number
  streakDays: number
  rating: number
  status: 'active' | 'suspended' | 'banned'
  createdAt: string
  updatedAt: string
}

// Club Types
export interface Club {
  id: string
  name: string
  description: string
  bannerUrl?: string
  isPrivate: boolean
  ownerId: string
  memberCount: number
  eventCount: number
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    fullName: string
    username: string
    avatarUrl?: string
  }
  userRole?: 'owner' | 'moderator' | 'member'
}

// Event Types
export interface Event {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  clubId: string
  creatorId: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    fullName: string
    username: string
    avatarUrl?: string
  }
}

// Skill Offer Types
export interface SkillOffer {
  id: string
  skillName: string
  offerType: 'teach' | 'learn'
  description: string
  location?: string
  latitude?: number
  longitude?: number
  profileId: string
  createdAt: string
  updatedAt: string
  profile: {
    id: string
    fullName: string
    username: string
    avatarUrl?: string
    rating: number
  }
}

// Message Types
export interface Message {
  id: string
  content: string
  conversationId: string
  senderId: string
  createdAt: string
  readAt?: string
  sender: {
    id: string
    fullName: string
    username: string
    avatarUrl?: string
  }
}

export interface Conversation {
  id: string
  createdAt: string
  updatedAt: string
  participants: {
    id: string
    fullName: string
    username: string
    avatarUrl?: string
  }[]
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
}

// Achievement Types
export interface Achievement {
  id: string
  name: string
  description: string
  type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned'
  points: number
  iconUrl?: string
  criteria: Record<string, any>
  createdAt: string
}

export interface UserAchievement {
  id: string
  achievementId: string
  profileId: string
  earnedAt: string
  progress: number
  achievement: Achievement
}

// Shop Types
export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  currencyType: 'personal' | 'club'
  category: 'avatar' | 'badge' | 'theme' | 'feature'
  iconUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  id: string
  itemId: string
  buyerId: string
  quantity: number
  totalCost: number
  currencyType: 'personal' | 'club'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  item: ShopItem
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string
  profileId: string
  points: number
  rank: number
  period: 'week' | 'month' | 'all_time'
  category: 'overall' | 'skills' | 'events' | 'currency'
  createdAt: string
  profile: {
    id: string
    fullName: string
    username: string
    avatarUrl?: string
  }
}

// Report Types
export interface Report {
  id: string
  target_type: 'post' | 'user' | 'club'
  target_id: string
  reason: 'inappropriate_content' | 'spam' | 'harassment' | 'fake_news' | 'copyright' | 'other'
  description?: string
  reporter_id: string
  status: 'pending' | 'resolved' | 'dismissed'
  moderator_id?: string
  moderator_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}
