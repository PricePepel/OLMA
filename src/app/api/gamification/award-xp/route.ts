import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse, errorHandlers } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, amount } = body

    const supabase = await createClient()
    
    // Get current user (for admin actions, this might be different from userId)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Validate input
    if (!userId || !action || !amount || amount <= 0) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid input parameters')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, experience_points, level')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'User profile not found')
    }

    // Calculate new XP and level
    const newXP = profile.experience_points + amount
    const newLevel = Math.floor(newXP / 100) + 1 // Simple level calculation

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        experience_points: newXP,
        level: newLevel
      })
      .eq('id', userId)

    if (updateError) {
      console.error('XP update error:', updateError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to update XP')
    }

    // Log the XP award
    console.log('[XP_AWARD]', {
      timestamp: new Date().toISOString(),
      userId,
      action,
      amount,
      oldXP: profile.experience_points,
      newXP,
      oldLevel: profile.level,
      newLevel
    })

    return createSuccessResponse({
      success: true,
      userId,
      action,
      amount,
      newXP,
      newLevel,
      levelUp: newLevel > profile.level
    })

  } catch (error) {
    console.error('XP award API error:', error)
    return errorHandlers.internalError(error)
  }
}
