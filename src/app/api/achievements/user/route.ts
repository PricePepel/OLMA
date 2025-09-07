import { NextRequest } from 'next/server'
import {
  createErrorResponse, createSuccessResponse, getAuthenticatedUser, errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    // Get user's achievements with achievement details
    const { data: userAchievements, error } = await supabase
      .from('achievements_user')
      .select(`
        *,
        achievement:achievements (
          id,
          name,
          description,
          type,
          points,
          icon_url
        )
      `)
      .eq('profile_id', user.id)
      .order('earned_at', { ascending: false })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    return createSuccessResponse(userAchievements || [])

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


