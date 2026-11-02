import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSuccessResponse, errorHandlers } from '@/lib/api-helpers'
import { expireOutdatedOffers, isAuthorizedCronRequest } from '@/lib/expire-offers'

// Never prerender or cache: every call has to reach the database.
export const dynamic = 'force-dynamic'

/**
 * GET /api/offers/expire
 * Daily Vercel cron (vercel.json): turns down pending meeting invitations
 * whose meeting date has passed. Only callers with CRON_SECRET get through.
 * It runs with the service role because there is no user session, and the
 * meeting_invitations RLS policies only let participants update their rows.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return errorHandlers.unauthorized()
  }

  try {
    const expiredIds = await expireOutdatedOffers(createAdminClient())

    console.log('Expire offers cron - expired:', expiredIds.length)

    return createSuccessResponse({
      expiredCount: expiredIds.length,
      expiredIds
    }, `Expired ${expiredIds.length} offers`)
  } catch (error) {
    return errorHandlers.internalError(error)
  }
}
