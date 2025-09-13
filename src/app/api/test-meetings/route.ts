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

    console.log('Test meetings API - User ID:', user.id)

    // Check if meeting_invitations table exists and has data
    const { data: allMeetings, error: meetingsError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .limit(10)

    console.log('Test meetings API - All meetings:', { allMeetings, meetingsError })

    // Check user's meetings specifically
    const { data: userMeetings, error: userMeetingsError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)

    console.log('Test meetings API - User meetings:', { userMeetings, userMeetingsError })

    // Check if skills table has hourly_rate
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id, name, hourly_rate')
      .limit(5)

    console.log('Test meetings API - Skills:', { skills, skillsError })

    return createSuccessResponse({
      allMeetings: allMeetings || [],
      userMeetings: userMeetings || [],
      skills: skills || [],
      errors: {
        meetingsError,
        userMeetingsError,
        skillsError
      }
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








