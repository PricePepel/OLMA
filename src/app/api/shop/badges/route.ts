import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let query = supabase
      .from('profile_badges')
      .select(`
        *,
        user_badges!left (
          user_id,
          is_equipped
        )
      `)
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: badges, error } = await query.order('category', { ascending: true }).order('price', { ascending: true })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Transform the data to include ownership status
    const transformedBadges = badges?.map(badge => ({
      ...badge,
      is_owned: badge.user_badges?.some((ub: any) => ub.user_id === user.id) || false,
      is_equipped: badge.user_badges?.some((ub: any) => ub.user_id === user.id && ub.is_equipped) || false
    })) || []

    return createSuccessResponse(transformedBadges)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return errorHandlers.unauthorized()
      }
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    const { badge_id } = body

    if (!badge_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Badge ID is required')
    }

    // Call the purchase_badge function
    const { data: result, error } = await supabase
      .rpc('purchase_badge', {
        p_user_id: user.id,
        p_badge_id: badge_id
      })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    if (!result.success) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, result.error)
    }

    return createSuccessResponse(result, 'Badge purchased successfully', 201)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return errorHandlers.unauthorized()
      }
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}
