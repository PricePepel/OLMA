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

    // Get user's rating statistics
    const { data: ratingStats, error: statsError } = await supabase
      .from('meeting_ratings')
      .select('rating')
      .eq('rated_user_id', userId)

    if (statsError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, statsError.message)
    }

    // Calculate average rating
    const ratings = ratingStats?.map(r => r.rating) || []
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0

    // Get recent ratings (last 5)
    const { data: recentRatings, error: recentError } = await supabase
      .from('meeting_ratings')
      .select(`
        *,
        rater:users!meeting_ratings_rater_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        meeting:meeting_invitations!meeting_ratings_meeting_id_fkey (
          id,
          inviter_skill_id,
          invitee_skill_id,
          inviter_skill:skills!meeting_invitations_inviter_skill_id_fkey (
            id,
            name
          ),
          invitee_skill:skills!meeting_invitations_invitee_skill_id_fkey (
            id,
            name
          )
        )
      `)
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, recentError.message)
    }

    return createSuccessResponse({
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      totalRatings: ratings.length,
      recentRatings: recentRatings || []
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
