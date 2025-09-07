import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiErrorCode } from '@/types/api'
import { z } from 'zod'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

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

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta
  }

  return NextResponse.json(response, { status })
}

export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  status: number = 400
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message
    }
  }

  return NextResponse.json(response, { status })
}

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabase }
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: any
): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Invalid data'
    throw new Error(`Validation error: ${errorMessage}`)
  }

  return result.data
}

// Common validation schemas
export const commonSchemas = {
  pagination: z.object({
    cursor: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    page: z.number().min(1).optional(),
  }),
  
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    location: z.string().optional(),
  }),
  
  userProfile: z.object({
    full_name: z.string().min(1).max(100),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    avatar_url: z.string().url().optional(),
  }),
  
  club: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    category: z.string().min(1).max(50),
    location: z.string().max(100).optional(),
    is_public: z.boolean().default(true),
    max_members: z.number().min(1).max(1000).optional(),
  }),
  
  event: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    location: z.string().max(100).optional(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    max_attendees: z.number().min(1).max(1000).optional(),
  }),
  
  message: z.object({
    content: z.string().min(1).max(1000),
  }),
}

export function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const key = `${userId}:${action}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export function buildSearchQuery(query: any, searchTerm: string) {
  return query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
}

export function buildCursorPagination(
  query: any,
  cursor: string | undefined,
  limit: number,
  orderBy: string = 'created_at',
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  if (cursor) {
    const [timestamp, id] = cursor.split(':')
    if (orderDirection === 'desc') {
      query = query.or(`${orderBy}.lt.${timestamp},and(${orderBy}.eq.${timestamp},id.lt.${id})`)
    } else {
      query = query.or(`${orderBy}.gt.${timestamp},and(${orderBy}.eq.${timestamp},id.gt.${id})`)
    }
  }

  return query
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .order('id', { ascending: orderDirection === 'asc' })
    .limit(limit + 1) // Get one extra to check if there are more
}

export function handleCursorPagination<T>(
  data: T[],
  limit: number
): { data: T[]; hasMore: boolean; cursor: string | null } {
  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  
  let cursor: string | null = null
  if (hasMore && items.length > 0) {
    const lastItem = items[items.length - 1] as any
    cursor = `${lastItem.created_at}:${lastItem.id}`
  }

  return {
    data: items,
    hasMore,
    cursor
  }
}

// Security utilities
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

// Permission checks
export async function checkUserPermission(
  supabase: any,
  userId: string,
  resourceType: 'club' | 'event' | 'post',
  resourceId: string,
  permission: 'read' | 'write' | 'delete'
): Promise<boolean> {
  try {
    switch (resourceType) {
      case 'club':
        const { data: clubMember } = await supabase
          .from('club_members')
          .select('role')
          .eq('club_id', resourceId)
          .eq('user_id', userId)
          .single()
        
        if (!clubMember) return false
        
        if (permission === 'delete') return clubMember.role === 'owner'
        if (permission === 'write') return ['owner', 'moderator'].includes(clubMember.role)
        return true // read permission for all members
        
      case 'event':
        const { data: event } = await supabase
          .from('events')
          .select('created_by, club_id')
          .eq('id', resourceId)
          .single()
        
        if (!event) return false
        
        if (event.created_by === userId) return true
        
        if (event.club_id) {
          const { data: clubMember } = await supabase
            .from('club_members')
            .select('role')
            .eq('club_id', event.club_id)
            .eq('user_id', userId)
            .single()
          
          if (permission === 'delete') return clubMember?.role === 'owner'
          if (permission === 'write') return ['owner', 'moderator'].includes(clubMember?.role || '')
          return true
        }
        
        return false
        
      case 'post':
        const { data: post } = await supabase
          .from('posts')
          .select('user_id, club_id')
          .eq('id', resourceId)
          .single()
        
        if (!post) return false
        
        if (post.user_id === userId) return true
        
        if (post.club_id) {
          const { data: clubMember } = await supabase
            .from('club_members')
            .select('role')
            .eq('club_id', post.club_id)
            .eq('user_id', userId)
            .single()
          
          if (permission === 'delete') return clubMember?.role === 'owner'
          if (permission === 'write') return ['owner', 'moderator'].includes(clubMember?.role || '')
          return true
        }
        
        return false
        
      default:
        return false
    }
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

export const errorHandlers = {
  unauthorized: () => createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Unauthorized', 401),
  forbidden: () => createErrorResponse(ApiErrorCode.FORBIDDEN, 'Forbidden', 403),
  notFound: () => createErrorResponse(ApiErrorCode.NOT_FOUND, 'Not found', 404),
  rateLimited: () => createErrorResponse(ApiErrorCode.RATE_LIMITED, 'Too many requests', 429),
  internalError: (error: any) => {
    console.error('Internal server error:', error)
    return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

// Location utilities
export function parseLocationString(locationStr: string): { lat: number; lng: number } | null {
  try {
    const [lat, lng] = locationStr.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return null
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    return { lat, lng }
  } catch {
    return null
  }
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Date utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString()
}

export function isDateInFuture(date: string | Date): boolean {
  return new Date(date) > new Date()
}

export function isDateInPast(date: string | Date): boolean {
  return new Date(date) < new Date()
}
