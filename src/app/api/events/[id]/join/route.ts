import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const { id: eventId } = await params

    // Check if event exists and is published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'published')
      .single()

    if (eventError || !event) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Event not found or not published')
    }

    // Check if user is already attending
    const { data: existingAttendance, error: attendanceError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (existingAttendance) {
      return createErrorResponse(ApiErrorCode.CONFLICT, 'You are already attending this event')
    }

    // Check if event is full
    if (event.max_attendees) {
      const { count: attendeeCount, error: countError } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)

      if (countError) {
        console.error('Error counting attendees:', countError)
      } else if (attendeeCount && attendeeCount >= event.max_attendees) {
        return createErrorResponse(ApiErrorCode.CONFLICT, 'Event is full')
      }
    }

    // Add user to event attendees
    const { error: joinError } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.id,
        status: 'confirmed'
      })

    if (joinError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, joinError.message)
    }

    return createSuccessResponse({}, 'Successfully joined event')

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

