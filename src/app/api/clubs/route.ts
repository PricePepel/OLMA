import { NextRequest } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
  getAuthenticatedUser,
  buildSearchQuery,
  buildCursorPagination,
  handleCursorPagination,
  errorHandlers,
  validateRequest,
  commonSchemas,
  sanitizeInput
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams
    const queryParams = {
      cursor: params.get('cursor') || undefined,
      q: params.get('q') || undefined,
      category: params.get('category') || undefined,
      limit: parseInt(params.get('limit') || '20'),
    }

    const { user, supabase } = await getAuthenticatedUser()

    // Build base query with joins
    let query = supabase
      .from('clubs')
      .select(`
        *,
        creator:users!clubs_created_by_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        _count:club_members(count)
      `)

    // Apply search filters
    if (queryParams.q) {
      const searchTerm = sanitizeInput(queryParams.q)
      query = buildSearchQuery(query, searchTerm)
    }

    // Apply category filter
    if (queryParams.category) {
      query = query.eq('category', sanitizeInput(queryParams.category))
    }

    // Apply cursor pagination
    query = buildCursorPagination(
      query,
      queryParams.cursor,
      queryParams.limit,
      'created_at',
      'desc'
    )

    const { data: clubs, error } = await query

    if (error) {
      console.error('Error fetching clubs:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Handle pagination
    const { data: items, hasMore, cursor } = handleCursorPagination(clubs || [], queryParams.limit)

    // Get member counts and user membership status
    const clubsWithDetails = await Promise.all(
      items.map(async (club) => {
        // Get member count
        const memberCount = club._count?.[0]?.count || 0

        // Check if user is a member
        const { data: membership, error: _membershipError } = await supabase
          .from('club_members')
          .select('role, joined_at')
          .eq('club_id', club.id)
          .eq('user_id', user.id)
          .single()

        if (_membershipError && _membershipError.code !== 'PGRST116') {
          console.error('Error fetching membership:', _membershipError)
        }

        // Get event count
        const { count: eventCount, error: eventError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
          .eq('status', 'published')

        if (eventError) {
          console.error('Error fetching event count:', eventError)
        }

        return {
          ...club,
          member_count: memberCount,
          event_count: eventCount || 0,
          user_membership: membership ? {
            role: membership.role,
            joined_at: membership.joined_at
          } : null
        }
      })
    )

    return createSuccessResponse({
      data: clubsWithDetails,
      total: clubsWithDetails.length,
      page: 1,
      limit: queryParams.limit,
      hasMore,
      cursor
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    // Validate request body
    const validatedData = validateRequest(commonSchemas.club, body)

    // Check if user already has too many clubs (limit to 5)
    const { count: userClubCount, error: countError } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)

    if (countError) {
      console.error('Error counting user clubs:', countError)
    } else if (userClubCount && userClubCount >= 5) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'You can only create up to 5 clubs'
      )
    }

    // Create club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: sanitizeInput(validatedData.name),
        description: validatedData.description ? sanitizeInput(validatedData.description) : null,
        category: sanitizeInput(validatedData.category),
        location: validatedData.location ? sanitizeInput(validatedData.location) : null,
        is_public: validatedData.is_public,
        max_members: validatedData.max_members,
        created_by: user.id
      })
      .select(`
        *,
        creator:users!clubs_created_by_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (clubError) {
      console.error('Error creating club:', clubError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, clubError.message)
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        club_id: club.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) {
      console.error('Error adding creator as member:', memberError)
      // Don't fail the request, but log the error
    }

    return createSuccessResponse(club, 'Club created successfully', 201)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return errorHandlers.unauthorized()
      }
      if (error.message.includes('Validation error')) {
        return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
      }
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}
