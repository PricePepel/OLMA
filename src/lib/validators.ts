import { z } from 'zod'

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
})

// Profile schemas
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
  visibility: z.enum(['public', 'club', 'private']).default('public'),
})

// Skill schemas
export const skillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(50, 'Skill name must be less than 50 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category must be less than 50 characters'),
  difficultyLevel: z.number().min(1).max(5, 'Difficulty level must be between 1 and 5'),
})

// Skill offer schemas
export const skillOfferSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
  offerType: z.enum(['teach', 'learn']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  availability: z.record(z.any()).optional(),
  geoOptIn: z.boolean().default(false),
})

// Club schemas
export const clubSchema = z.object({
  name: z.string().min(2, 'Club name must be at least 2 characters').max(100, 'Club name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  bannerUrl: z.string().url('Invalid URL').optional(),
  isPrivate: z.boolean().default(false),
})

// Club event schemas
export const clubEventSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters').max(100, 'Event title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  datetimeStart: z.string().datetime('Invalid start date'),
  datetimeEnd: z.string().datetime('Invalid end date'),
  locationId: z.string().uuid('Invalid location ID').optional(),
  maxAttendees: z.number().min(1, 'Max attendees must be at least 1').optional(),
})

// Post schemas
export const postSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(5000, 'Post content must be less than 5000 characters'),
  clubId: z.string().uuid('Invalid club ID').optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL')).max(5, 'Maximum 5 media files allowed').optional(),
})

// Message schemas
export const messageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(2000, 'Message content must be less than 2000 characters'),
})

// Report schemas
export const reportSchema = z.object({
  targetType: z.enum(['profile', 'post', 'club', 'message']),
  targetId: z.string().uuid('Invalid target ID'),
  reportType: z.enum(['inappropriate_content', 'harassment', 'spam', 'fake_profile', 'other']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must be less than 500 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
})

// Shop schemas
export const purchaseSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity must be less than 100'),
})

// Location schemas
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  addressText: z.string().max(200, 'Address must be less than 200 characters'),
  privacyLevel: z.enum(['public', 'club', 'private']).default('public'),
})

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(100, 'Search query must be less than 100 characters'),
  filters: z.record(z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').default(20),
})

// Form schemas with error messages
export const formSchemas = {
  signIn: signInSchema,
  signUp: signUpSchema,
  profile: profileSchema,
  skill: skillSchema,
  skillOffer: skillOfferSchema,
  club: clubSchema,
  clubEvent: clubEventSchema,
  post: postSchema,
  message: messageSchema,
  report: reportSchema,
  purchase: purchaseSchema,
  location: locationSchema,
  search: searchSchema,
  pagination: paginationSchema,
} as const

export type FormSchemas = typeof formSchemas

// Type exports for individual schemas
export type SignInSchema = z.infer<typeof signInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
export type ProfileSchema = z.infer<typeof profileSchema>
export type SkillSchema = z.infer<typeof skillSchema>
export type SkillOfferSchema = z.infer<typeof skillOfferSchema>
export type ClubSchema = z.infer<typeof clubSchema>
export type ClubEventSchema = z.infer<typeof clubEventSchema>
export type PostSchema = z.infer<typeof postSchema>
export type MessageSchema = z.infer<typeof messageSchema>
export type ReportSchema = z.infer<typeof reportSchema>
export type PurchaseSchema = z.infer<typeof purchaseSchema>
export type LocationSchema = z.infer<typeof locationSchema>
export type SearchSchema = z.infer<typeof searchSchema>
export type PaginationSchema = z.infer<typeof paginationSchema>
