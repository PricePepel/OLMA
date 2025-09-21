import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Get user_id from query params (for getting other user's skills)
    const url = new URL(request.url)
    const targetUserId = url.searchParams.get('user_id') || user.id

    // Fetch user skills with skill details
    const { data: userSkills, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', targetUserId)

    if (error) {
      console.error('Error fetching user skills:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to fetch user skills')
    }

    console.log('User skills API response:', userSkills)
    console.log('User skills count:', userSkills?.length || 0)
    console.log('Target User ID:', targetUserId)
    return createSuccessResponse(userSkills || [])
  } catch (error) {
    console.error('GET /api/user/skills error:', error)
    return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Internal server error')
  }
}
