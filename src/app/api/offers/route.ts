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
    const status = url.searchParams.get('status') // Filter by status if provided

    console.log('Offers API - User ID:', user.id, 'Status filter:', status)

    // First, check for and expire any outdated pending offers
    try {
      const now = new Date().toISOString()
      const { error: expireError } = await supabase
        .from('meeting_invitations')
        .update({ 
          status: 'denied',
          updated_at: now
        })
        .eq('status', 'pending')
        .lt('meeting_date', now)
        .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)

      if (expireError) {
        console.warn('Failed to expire outdated offers:', expireError)
      }
    } catch (expireError) {
      console.warn('Error during offer expiration check:', expireError)
    }

    let query = supabase
      .from('meeting_invitations')
      .select(`
        *,
        skill:skills (
          id,
          name,
          category
        ),
        inviter:users!meeting_invitations_inviter_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        invitee:users!meeting_invitations_invitee_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: offers, error } = await query.order('created_at', { ascending: false })

    console.log('Offers API - Query result:', { offers, error })

    if (error) {
      console.error('Offers API - Error:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Transform offers to include additional information
    const transformedOffers = offers?.map(offer => {
      const isInviter = offer.inviter_id === user.id
      const otherUser = isInviter ? offer.invitee : offer.inviter
      
      // Calculate currency for completed meetings
      let currencyAmount = 0
      let currencyType = 'earned' // or 'spent'
      
      if (offer.status === 'completed') {
        // For now, use a default hourly rate since skills table might not have hourly_rate
        const hourlyRate = offer.skill?.hourly_rate || 25 // Default $25/hour
        if (isInviter) {
          // If you're the inviter (teacher), you earn money
          currencyAmount = offer.meeting_duration * hourlyRate / 60
          currencyType = 'earned'
        } else {
          // If you're the invitee (student), you spend money
          currencyAmount = offer.meeting_duration * hourlyRate / 60
          currencyType = 'spent'
        }
      }

      return {
        ...offer,
        other_user: otherUser,
        is_inviter: isInviter,
        currency_amount: currencyAmount,
        currency_type: currencyType,
        formatted_date: new Date(offer.meeting_date).toLocaleDateString(),
        formatted_time: new Date(offer.meeting_date).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    }) || []

    return createSuccessResponse(transformedOffers)

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