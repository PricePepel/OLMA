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
    const conversationId = url.searchParams.get('conversation_id')

    let query = supabase
      .from('meeting_invitations')
      .select(`
        *,
        skill:skills (
          id,
          name,
          category
        ),
        inviter:users!meeting_invitations_inviter_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        invitee:users!meeting_invitations_invitee_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    } else {
      // Get all meeting invitations for the current user
      query = query.or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
    }

    const { data: meetings, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    return createSuccessResponse(meetings || [])

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

    const {
      conversation_id,
      invitee_id,
      skill_id,
      meeting_location,
      meeting_date,
      meeting_duration = 60,
      inviter_message
    } = body

    // Validate required fields
    if (!conversation_id || !invitee_id || !skill_id || !meeting_location || !meeting_date) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Missing required fields')
    }

    // Verify the user is part of the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversation_id)
      .single()

    if (conversationError || !conversation) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Conversation not found')
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Access denied to this conversation')
    }

    // Verify the invitee is the other participant
    const otherUserId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id
    if (otherUserId !== invitee_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid invitee')
    }

    // Create meeting invitation
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_invitations')
      .insert({
        conversation_id,
        inviter_id: user.id,
        invitee_id,
        skill_id,
        meeting_location,
        meeting_date,
        meeting_duration,
        inviter_message,
        status: 'pending'
      })
      .select(`
        *,
        skill:skills (
          id,
          name,
          category
        ),
        inviter:users!meeting_invitations_inviter_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        invitee:users!meeting_invitations_invitee_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (meetingError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, meetingError.message)
    }

    return createSuccessResponse(meeting, 'Meeting invitation sent successfully', 201)

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







