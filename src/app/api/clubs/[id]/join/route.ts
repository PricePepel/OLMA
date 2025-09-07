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
    const { id: clubId } = await params

    // Check if club exists and is public
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .eq('is_public', true)
      .single()

    if (clubError || !club) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Club not found or not public')
    }

    // Check if user is already a member
    const { data: existingMembership, error: membershipError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single()

    if (existingMembership) {
      return createErrorResponse(ApiErrorCode.CONFLICT, 'You are already a member of this club')
    }

    // Check if club is full
    if (club.max_members) {
      const { count: memberCount, error: countError } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)

      if (countError) {
        console.error('Error counting members:', countError)
      } else if (memberCount && memberCount >= club.max_members) {
        return createErrorResponse(ApiErrorCode.CONFLICT, 'Club is full')
      }
    }

    // Add user to club members
    const { error: joinError } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: 'member'
      })

    if (joinError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, joinError.message)
    }

    return createSuccessResponse({}, 'Successfully joined club')

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

