import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

/**
 * POST /api/offers/expire
 * Checks for and updates expired meeting invitations
 * This endpoint can be called manually or by a cron job
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    
    console.log('Expire offers API - User ID:', user.id)
    
    // Use the database function for better performance
    const { data: result, error } = await supabase
      .rpc('check_and_expire_offers')

    if (error) {
      console.error('Error calling expire offers function:', error)
      
      // Fallback to manual approach if function doesn't exist
      const now = new Date().toISOString()
      
      const { data: expiredOffers, error: fetchError } = await supabase
        .from('meeting_invitations')
        .select(`
          id,
          meeting_date,
          status,
          inviter_id,
          invitee_id,
          skill:skills (
            id,
            name,
            category
          ),
          inviter:users!meeting_invitations_inviter_id_fkey (
            id,
            full_name,
            username
          ),
          invitee:users!meeting_invitations_invitee_id_fkey (
            id,
            full_name,
            username
          )
        `)
        .eq('status', 'pending')
        .lt('meeting_date', now)
        .order('meeting_date', { ascending: true })

      if (fetchError) {
        return createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          'Failed to fetch expired offers'
        )
      }

      if (!expiredOffers || expiredOffers.length === 0) {
        return createSuccessResponse({
          message: 'No expired offers found',
          expiredCount: 0,
          updatedOffers: []
        })
      }

      // Update all expired offers to 'denied' status
      const offerIds = expiredOffers.map(offer => offer.id)
      
      const { data: updatedOffers, error: updateError } = await supabase
        .from('meeting_invitations')
        .update({ 
          status: 'denied',
          updated_at: now
        })
        .in('id', offerIds)
        .select(`
          id,
          meeting_date,
          status,
          inviter_id,
          invitee_id,
          skill:skills (
            id,
            name,
            category
          ),
          inviter:users!meeting_invitations_inviter_id_fkey (
            id,
            full_name,
            username
          ),
          invitee:users!meeting_invitations_invitee_id_fkey (
            id,
            full_name,
            username
          )
        `)

      if (updateError) {
        return createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          'Failed to update expired offers'
        )
      }

      return createSuccessResponse({
        message: `Successfully expired ${updatedOffers?.length || 0} offers`,
        expiredCount: expiredOffers.length,
        updatedOffers: updatedOffers || []
      })
    }

    console.log('Expire offers function result:', result)

    return createSuccessResponse({
      message: result.message || 'Offers expiration check completed',
      expiredCount: result.expired_count || 0,
      expiredIds: result.expired_ids || [],
      timestamp: result.timestamp
    })

  } catch (error) {
    console.error('Expire offers API error:', error)
    return errorHandlers.internalError(error)
  }
}

/**
 * GET /api/offers/expire
 * Check for expired offers without updating them (for monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    
    console.log('Check expired offers API - User ID:', user.id)
    
    // Find all pending meeting invitations where the meeting date has passed
    const now = new Date().toISOString()
    
    const { data: expiredOffers, error } = await supabase
      .from('meeting_invitations')
      .select(`
        id,
        meeting_date,
        status,
        inviter_id,
        invitee_id,
        skill:skills (
          id,
          name,
          category
        ),
        inviter:users!meeting_invitations_inviter_id_fkey (
          id,
          full_name,
          username
        ),
        invitee:users!meeting_invitations_invitee_id_fkey (
          id,
          full_name,
          username
        )
      `)
      .eq('status', 'pending')
      .lt('meeting_date', now)
      .order('meeting_date', { ascending: true })

    if (error) {
      console.error('Error fetching expired offers:', error)
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        'Failed to fetch expired offers'
      )
    }

    return createSuccessResponse({
      message: `Found ${expiredOffers?.length || 0} expired offers`,
      expiredCount: expiredOffers?.length || 0,
      expiredOffers: expiredOffers || []
    })

  } catch (error) {
    console.error('Check expired offers API error:', error)
    return errorHandlers.internalError(error)
  }
}
