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
      reported_user_id,
      report_category,
      report_reason,
      description
    } = body

    // Validate required fields
    if (!meeting_id || !reported_user_id || !report_category || !report_reason) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Missing required fields')
    }

    // Validate report category
    const validCategories = ['easy', 'medium', 'hard']
    if (!validCategories.includes(report_category)) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid report category')
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
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Can only report on completed meetings')
    }

    // Verify the user is part of the meeting
    if (meeting.inviter_id !== user.id && meeting.invitee_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Access denied to this meeting')
    }

    // Verify the reported user is the other participant
    const otherUserId = meeting.inviter_id === user.id ? meeting.invitee_id : meeting.inviter_id
    if (otherUserId !== reported_user_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid reported user')
    }

    // Prevent self-reporting
    if (user.id === reported_user_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Cannot report yourself')
    }

    // Check if report already exists for this meeting
    const { data: existingReport, error: existingError } = await supabase
      .from('meeting_reports')
      .select('id')
      .eq('meeting_id', meeting_id)
      .eq('reporter_id', user.id)
      .eq('reported_user_id', reported_user_id)
      .single()

    if (existingReport) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Report already exists for this meeting')
    }

    // Create the report
    const { data: reportData, error: reportError } = await supabase
      .from('meeting_reports')
      .insert({
        meeting_id,
        reporter_id: user.id,
        reported_user_id,
        report_category,
        report_reason,
        description: description?.trim() || null,
        status: 'pending'
      })
      .select(`
        *,
        reporter:users!meeting_reports_reporter_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        reported_user:users!meeting_reports_reported_user_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (reportError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, reportError.message)
    }

    return createSuccessResponse(reportData, 'Report submitted successfully', 201)

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
    const status = url.searchParams.get('status')

    let query = supabase
      .from('meeting_reports')
      .select(`
        *,
        reporter:users!meeting_reports_reporter_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        reported_user:users!meeting_reports_reported_user_id_fkey (
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
      query = query.eq('reported_user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    return createSuccessResponse(reports || [])

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





