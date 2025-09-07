import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse, errorHandlers } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params
    const body = await request.json()
    const { action, reason } = body

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Check if user is a moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Moderator access required')
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Report not found')
    }

    if (report.status !== 'pending') {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Report has already been processed')
    }

    // Update report status
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        moderator_id: user.id,
        moderator_notes: reason,
        resolved_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('Report update error:', updateError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to update report')
    }

    // Take action on the reported content
    if (action === 'resolve' && report.target_type === 'post') {
      // Hide the post
      const { error: postError } = await supabase
        .from('posts')
        .update({ status: 'hidden' })
        .eq('id', report.target_id)

      if (postError) {
        console.error('Post hide error:', postError)
        // Don't fail the report action if post hiding fails
      }
    }

    // Log the moderation action
    console.log('[MODERATION]', {
      timestamp: new Date().toISOString(),
      moderator: user.id,
      reportId,
      action,
      reason,
      targetType: report.target_type,
      targetId: report.target_id
    })

    return createSuccessResponse({ 
      success: true,
      action,
      reportId 
    })

  } catch (error) {
    console.error('Report action API error:', error)
    return errorHandlers.internalError(error)
  }
}
