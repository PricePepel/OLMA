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
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()
    const { id: clubId } = await params

    // Validate required fields
    if (!body.title || !body.description || !body.start_time || !body.end_time) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Event title, description, start time, and end time are required')
    }

    // Check if club exists
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (clubError || !club) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Club not found')
    }

    // Check if user is a member of the club
    const { data: membership, error: membershipError } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'You must be a member of the club to create events')
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: body.title,
        description: body.description,
        club_id: clubId,
        created_by: user.id,
        location: body.location || null,
        start_time: body.start_time,
        end_time: body.end_time,
        max_attendees: body.max_attendees || null,
        status: 'published'
      })
      .select(`
        *,
        creator:users!events_created_by_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        club:clubs!events_club_id_fkey (
          id,
          name,
          description
        )
      `)
      .single()

    if (eventError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, eventError.message)
    }

    return createSuccessResponse(event, 'Event created successfully', 201)

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
