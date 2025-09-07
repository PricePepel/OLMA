import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    const {
      meeting_id,
      rated_user_id,
      rating,
      comment
    } = body

    // Validate required fields
    if (!meeting_id || !rated_user_id || !rating) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Missing required fields')
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Rating must be between 1 and 5')
    }

    // Verify the meeting exists and is completed
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', meeting_id)
      .single()

    if (meetingError || !meeting) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Meeting not found')
    }

    if (meeting.status !== 'completed') {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Can only rate completed meetings')
    }

    // Verify the user is part of the meeting
    if (meeting.inviter_id !== user.id && meeting.invitee_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Access denied to this meeting')
    }

    // Verify the rated user is the other participant
    const otherUserId = meeting.inviter_id === user.id ? meeting.invitee_id : meeting.inviter_id
    if (otherUserId !== rated_user_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid rated user')
    }

    // Check if rating already exists
    const { data: existingRating, error: existingError } = await supabase
      .from('meeting_ratings')
      .select('id')
      .eq('meeting_id', meeting_id)
      .eq('rater_id', user.id)
      .eq('rated_user_id', rated_user_id)
      .single()

    if (existingRating) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Rating already exists for this meeting')
    }

    // Create the rating
    const { data: ratingData, error: ratingError } = await supabase
      .from('meeting_ratings')
      .insert({
        meeting_id,
        rater_id: user.id,
        rated_user_id,
        rating,
        comment: comment?.trim() || null
      })
      .select(`
        *,
        rater:users!meeting_ratings_rater_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        rated_user:users!meeting_ratings_rated_user_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (ratingError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, ratingError.message)
    }

    return createSuccessResponse(ratingData, 'Rating submitted successfully', 201)

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

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const url = new URL(request.url)
    const meetingId = url.searchParams.get('meeting_id')
    const userId = url.searchParams.get('user_id')

    let query = supabase
      .from('meeting_ratings')
      .select(`
        *,
        rater:users!meeting_ratings_rater_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        rated_user:users!meeting_ratings_rated_user_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)

    if (meetingId) {
      query = query.eq('meeting_id', meetingId)
    }

    if (userId) {
      query = query.eq('rated_user_id', userId)
    }

    const { data: ratings, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    return createSuccessResponse(ratings || [])

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

