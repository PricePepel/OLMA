import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse, errorHandlers } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
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

    // Get active restrictions
    const { data: restrictions, error } = await supabase
      .from('user_restrictions')
      .select(`
        *,
        user:profiles!user_restrictions_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Restrictions fetch error:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to fetch restrictions')
    }

    return createSuccessResponse({ restrictions })

  } catch (error) {
    console.error('Restrictions API error:', error)
    return errorHandlers.internalError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, duration } = body

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

    // Verify target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'User not found')
    }

    // Prevent moderators from restricting admins
    if (targetUser.role === 'admin' && profile.role !== 'admin') {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Cannot restrict admin users')
    }

    // Calculate expiration date
    let expiresAt: string | null = null
    if (duration && duration > 0) {
      const expirationDate = new Date()
      expirationDate.setMinutes(expirationDate.getMinutes() + duration)
      expiresAt = expirationDate.toISOString()
    }

    // Create restriction
    const { data: restriction, error: insertError } = await supabase
      .from('user_restrictions')
      .insert({
        user_id: userId,
        moderator_id: user.id,
        type: action,
        reason: `Restricted by ${profile.role}`,
        expires_at: expiresAt,
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Restriction creation error:', insertError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to create restriction')
    }

    // Log the restriction action
    console.log('[RESTRICTION]', {
      timestamp: new Date().toISOString(),
      moderator: user.id,
      targetUser: userId,
      action,
      duration,
      expiresAt
    })

    return createSuccessResponse({ 
      success: true,
      restriction 
    })

  } catch (error) {
    console.error('Restriction creation API error:', error)
    return errorHandlers.internalError(error)
  }
}
