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
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id') || user.id

    // Get user's ban status
    const { data: banStatus, error: banError } = await supabase
      .from('user_ban_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (banError && banError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, banError.message)
    }

    // Get user's violation counts
    const { data: violations, error: violationsError } = await supabase
      .from('user_violations')
      .select('violation_type')
      .eq('user_id', userId)

    if (violationsError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, violationsError.message)
    }

    // Count violations by type
    const violationCounts = violations?.reduce((acc, violation) => {
      acc[violation.violation_type] = (acc[violation.violation_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const response = {
      is_banned: banStatus?.is_banned || false,
      ban_reason: banStatus?.ban_reason || null,
      banned_at: banStatus?.banned_at || null,
      expires_at: banStatus?.expires_at || null,
      violation_counts: {
        easy: violationCounts.easy || 0,
        medium: violationCounts.medium || 0,
        hard: violationCounts.hard || 0,
        total: Object.values(violationCounts).reduce((sum, count) => sum + count, 0)
      },
      thresholds: {
        easy: 15,
        medium: 10,
        hard: 3
      }
    }

    return createSuccessResponse(response)

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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    const {
      user_id,
      is_banned,
      ban_reason,
      expires_at
    } = body

    // Only allow admins to modify ban status
    // You might want to add admin role checking here
    // For now, we'll allow any authenticated user to modify their own status
    
    if (user_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Can only modify your own ban status')
    }

    const updateData: any = {
      is_banned,
      updated_at: new Date().toISOString()
    }

    if (ban_reason) {
      updateData.ban_reason = ban_reason
    }

    if (is_banned) {
      updateData.banned_at = new Date().toISOString()
      if (expires_at) {
        updateData.expires_at = expires_at
      }
    } else {
      updateData.banned_at = null
      updateData.expires_at = null
    }

    const { data: banStatus, error: banError } = await supabase
      .from('user_ban_status')
      .upsert({
        user_id,
        ...updateData
      })
      .select('*')
      .single()

    if (banError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, banError.message)
    }

    return createSuccessResponse(banStatus, 'Ban status updated successfully')

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







