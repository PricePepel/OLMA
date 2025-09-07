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

    console.log('Offers stats API - User ID:', user.id)

    // Get all offers for the user
    const { data: allOffers, error: offersError } = await supabase
      .from('meeting_invitations')
      .select(`
        *,
        skill:skills (
          hourly_rate
        )
      `)
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)

    console.log('Offers stats API - Query result:', { allOffers, offersError })

    if (offersError) {
      console.error('Offers stats API - Error:', offersError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, offersError.message)
    }

    // Calculate statistics
    const stats = {
      total: allOffers?.length || 0,
      pending: allOffers?.filter(offer => offer.status === 'pending').length || 0,
      accepted: allOffers?.filter(offer => offer.status === 'accepted').length || 0,
      completed: allOffers?.filter(offer => offer.status === 'completed').length || 0,
      denied: allOffers?.filter(offer => offer.status === 'denied').length || 0,
      started: allOffers?.filter(offer => offer.status === 'started').length || 0,
      cancelled: allOffers?.filter(offer => offer.status === 'cancelled').length || 0,
      totalEarned: 0,
      totalSpent: 0,
      totalHours: 0
    }

    // Calculate earnings and spending for completed meetings
    allOffers?.forEach(offer => {
      if (offer.status === 'completed') {
        const isInviter = offer.inviter_id === user.id
        const hourlyRate = offer.skill?.hourly_rate || 25 // Default $25/hour
        const durationHours = offer.meeting_duration / 60
        const amount = hourlyRate * durationHours

        stats.totalHours += durationHours

        if (isInviter) {
          // Teacher earns money
          stats.totalEarned += amount
        } else {
          // Student spends money
          stats.totalSpent += amount
        }
      }
    })

    // Round to 2 decimal places
    stats.totalEarned = Math.round(stats.totalEarned * 100) / 100
    stats.totalSpent = Math.round(stats.totalSpent * 100) / 100
    stats.totalHours = Math.round(stats.totalHours * 100) / 100

    return createSuccessResponse(stats)

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
