import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse, createSuccessResponse, getAuthenticatedUser, errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'
import { logModerationAction } from '@/lib/safety'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const body = await request.json()
    const { action, details } = body

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return createErrorResponse(
        ApiErrorCode.FORBIDDEN,
        'Access denied. Admin privileges required.'
      )
    }

    const { id } = await params
    
    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return errorHandlers.notFound()
    }

    let updateData: any = {}
    let targetUpdateData: any = {}

    switch (action) {
      case 'resolve':
        updateData = { status: 'resolved' }
        break

      case 'reject':
        updateData = { status: 'rejected' }
        break

      case 'review':
        updateData = { status: 'review' }
        break

      case 'hide_content':
        updateData = { status: 'resolved' }
        // Hide the target content based on type
        switch (report.target_type) {
          case 'post':
            targetUpdateData = { is_hidden: true }
            break
          case 'message':
            targetUpdateData = { is_hidden: true }
            break
          case 'profile':
            targetUpdateData = { visibility: 'private' }
            break
        }
        break

      case 'delete_content':
        updateData = { status: 'resolved' }
        // Delete the target content based on type
        switch (report.target_type) {
          case 'post':
            await supabase.from('posts').delete().eq('id', report.target_id)
            break
          case 'message':
            await supabase.from('messages').delete().eq('id', report.target_id)
            break
          case 'profile':
            // Don't delete profiles, just ban the user
            await supabase.from('profiles').update({ is_banned: true }).eq('id', report.target_id)
            break
        }
        break

      case 'ban_user':
        updateData = { status: 'resolved' }
        // Ban the user who created the reported content
        let userIdToBan: string | null = null

        switch (report.target_type) {
          case 'post':
            const { data: post } = await supabase
              .from('posts')
              .select('author_id')
              .eq('id', report.target_id)
              .single()
            userIdToBan = post?.author_id || null
            break
          case 'message':
            const { data: message } = await supabase
              .from('messages')
              .select('sender_id')
              .eq('id', report.target_id)
              .single()
            userIdToBan = message?.sender_id || null
            break
          case 'profile':
            userIdToBan = report.target_id
            break
        }

        if (userIdToBan) {
          await supabase
            .from('profiles')
            .update({ 
              is_banned: true,
              banned_at: new Date().toISOString(),
              ban_reason: details || 'Violation of community guidelines'
            })
            .eq('id', userIdToBan)
        }
        break

      case 'soft_ban':
        updateData = { status: 'resolved' }
        // Apply temporary restrictions
        let userIdToRestrict: string | null = null

        switch (report.target_type) {
          case 'post':
            const { data: post } = await supabase
              .from('posts')
              .select('author_id')
              .eq('id', report.target_id)
              .single()
            userIdToRestrict = post?.author_id || null
            break
          case 'message':
            const { data: message } = await supabase
              .from('messages')
              .select('sender_id')
              .eq('id', report.target_id)
              .single()
            userIdToRestrict = message?.sender_id || null
            break
          case 'profile':
            userIdToRestrict = report.target_id
            break
        }

        if (userIdToRestrict) {
          const restrictionEnd = new Date()
          restrictionEnd.setHours(restrictionEnd.getHours() + 24) // 24 hour restriction

          await supabase
            .from('profiles')
            .update({ 
              is_restricted: true,
              restriction_end: restrictionEnd.toISOString(),
              restriction_reason: details || 'Temporary restriction for violation'
            })
            .eq('id', userIdToRestrict)
        }
        break

      default:
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Invalid action specified'
        )
    }

    // Update the report
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        ...updateData,
        resolved_at: action === 'resolve' || action === 'reject' ? new Date().toISOString() : null,
        resolved_by: user.id,
        resolution_notes: details || null
      })
      .eq('id', id)

    if (updateError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, updateError.message)
    }

    // Update target content if needed
    if (Object.keys(targetUpdateData).length > 0) {
      switch (report.target_type) {
        case 'post':
          await supabase
            .from('posts')
            .update(targetUpdateData)
            .eq('id', report.target_id)
          break
        case 'message':
          await supabase
            .from('messages')
            .update(targetUpdateData)
            .eq('id', report.target_id)
          break
        case 'profile':
          await supabase
            .from('profiles')
            .update(targetUpdateData)
            .eq('id', report.target_id)
          break
      }
    }

    // Log the moderation action
    logModerationAction(supabase, {
      moderatorId: user.id,
      targetType: report.target_type as any,
      targetId: report.target_id,
      action: action as any,
      reason: details || `Report ${action}`
    })

    return createSuccessResponse(
      { action, reportId: id },
      `Report ${action} successfully`
    )

  } catch (error) {
    console.error('Error updating report:', error)
    return errorHandlers.internalError(error)
  }
}
