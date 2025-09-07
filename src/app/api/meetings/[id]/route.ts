import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()
    const { id } = await params

    const { status, invitee_response } = body

    // Validate status
    const validStatuses = ['accepted', 'denied', 'started', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid status')
    }

    // Get the meeting invitation
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', id)
      .single()

    if (meetingError || !meeting) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Meeting invitation not found')
    }

    // Check permissions
    if (meeting.inviter_id !== user.id && meeting.invitee_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Access denied to this meeting')
    }

    // Only invitee can accept/deny, both can start/complete/cancel
    if ((status === 'accepted' || status === 'denied') && meeting.invitee_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Only the invitee can accept or deny the invitation')
    }

    // Update the meeting invitation
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (invitee_response && (status === 'accepted' || status === 'denied')) {
      updateData.invitee_response = invitee_response
    }

    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meeting_invitations')
      .update(updateData)
      .eq('id', id)
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

    if (updateError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, updateError.message)
    }

    return createSuccessResponse(updatedMeeting, `Meeting ${status} successfully`)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const { id } = await params

    // Get the meeting invitation
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', id)
      .single()

    if (meetingError || !meeting) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Meeting invitation not found')
    }

    // Only the inviter can delete the invitation
    if (meeting.inviter_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Only the inviter can delete the invitation')
    }

    // Delete the meeting invitation
    const { error: deleteError } = await supabase
      .from('meeting_invitations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, deleteError.message)
    }

    return createSuccessResponse(null, 'Meeting invitation deleted successfully')

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




