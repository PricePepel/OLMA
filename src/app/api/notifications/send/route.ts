import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse, errorHandlers } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, target_type, target_id, report_id } = body

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Validate input
    if (!type || !target_type || !target_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid input parameters')
    }

    // Get all moderators and admins
    const { data: moderators, error: modError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['moderator', 'admin'])

    if (modError) {
      console.error('Moderator fetch error:', modError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to fetch moderators')
    }

    if (!moderators || moderators.length === 0) {
      return createSuccessResponse({ success: true, message: 'No moderators found' })
    }

    // Create notifications for all moderators
    const notifications = moderators.map(mod => ({
      user_id: mod.id,
      type,
      title: 'New Report',
      message: `New ${target_type} report requires review`,
      data: {
        target_type,
        target_id,
        report_id
      },
      status: 'unread'
    }))

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notifError) {
      console.error('Notification creation error:', notifError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to create notifications')
    }

    // Log the notification
    console.log('[NOTIFICATION]', {
      timestamp: new Date().toISOString(),
      type,
      target_type,
      target_id,
      report_id,
      recipients: moderators.length
    })

    return createSuccessResponse({
      success: true,
      notificationsSent: moderators.length
    })

  } catch (error) {
    console.error('Notification API error:', error)
    return errorHandlers.internalError(error)
  }
}
