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
    const userId = url.searchParams.get('user_id') || user.id

    // Get user's badges
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:profile_badges (
          id,
          name,
          description,
          category,
          icon_url,
          rarity,
          price
        )
      `)
      .eq('user_id', userId)

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Get equipped badges
    const { data: equippedBadges, error: equippedError } = await supabase
      .from('user_equipped_badges')
      .select('*')
      .eq('user_id', userId)

    if (equippedError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, equippedError.message)
    }

    return createSuccessResponse({
      badges: userBadges || [],
      equipped: equippedBadges || []
    })

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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    const { badge_id, equip } = body

    if (!badge_id || typeof equip !== 'boolean') {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Badge ID and equip status are required')
    }

    // Call the toggle_badge_equip function
    const { data: result, error } = await supabase
      .rpc('toggle_badge_equip', {
        p_user_id: user.id,
        p_badge_id: badge_id,
        p_equip: equip
      })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    if (!result.success) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, result.error)
    }

    return createSuccessResponse(result, result.message)

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
