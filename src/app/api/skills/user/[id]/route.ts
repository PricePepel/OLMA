import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    const { id: skillId } = await params

    // Check if user skill exists and belongs to the user
    const { data: userSkill, error: fetchError } = await supabase
      .from('user_skills')
      .select('id')
      .eq('id', skillId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !userSkill) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'User skill not found')
    }

    // Delete the user skill
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting user skill:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to delete user skill')
    }

    return createSuccessResponse({ message: 'User skill deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/skills/user/[id] error:', error)
    return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Internal server error')
  }
}
