import { NextRequest } from 'next/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  buildSearchQuery,
  buildCursorPagination,
  handleCursorPagination,
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams
    const queryParams = {
      cursor: params.get('cursor') || undefined,
      q: params.get('q') || undefined,
      club_id: params.get('club_id') || undefined,
      limit: parseInt(params.get('limit') || '20'),
    }

    const { user, supabase } = await getAuthenticatedUser()
    
    // Build base query with joins
    let query = supabase
      .from('events')
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

    // Apply search filters
    if (queryParams.q) {
      query = buildSearchQuery(query, queryParams.q)
    }

    // Apply club filter
    if (queryParams.club_id) {
      query = query.eq('club_id', queryParams.club_id)
    }

    // Apply cursor pagination
    query = buildCursorPagination(
      query,
      queryParams.cursor,
      queryParams.limit,
      'start_time',
      'asc'
    )

    const { data: events, error } = await query

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Handle pagination
    const { data: items, hasMore, cursor } = handleCursorPagination(events, queryParams.limit)

    // Get attendee counts
    const eventsWithDetails = await Promise.all(
      items.map(async (event) => {
        // Get attendee count
        const { count: attendeeCount, error: attendeeError } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        if (attendeeError) {
          console.error('Error fetching attendee count:', attendeeError)
        }

        // Check if user is attending
        const { data: userAttendance, error: _attendanceError } = await supabase
          .from('event_attendees')
          .select('status')
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          .single()

        if (_attendanceError && _attendanceError.code !== 'PGRST116') {
          console.error('Error fetching user attendance:', _attendanceError)
        }

        return {
          ...event,
          attendee_count: attendeeCount || 0,
          user_attendance: userAttendance?.status || null
        }
      })
    )

    return createSuccessResponse({
      data: eventsWithDetails,
      total: eventsWithDetails.length,
      page: 1,
      limit: queryParams.limit,
      hasMore,
      cursor
    })

  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    // Validate required fields
    if (!body.title || !body.description || !body.start_time || !body.end_time) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Event title, description, start time, and end time are required')
    }

    // Validate that user is a member of the club if club_id is provided
    if (body.club_id) {
      const { data: membership, error: membershipError } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', body.club_id)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        return createErrorResponse(ApiErrorCode.FORBIDDEN, 'You must be a member of the club to create events')
      }
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: body.title,
        description: body.description,
        club_id: body.club_id || null,
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






