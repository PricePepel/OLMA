import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Vercel sends CRON_SECRET as a bearer token when it runs a cron job.
 * An unset secret never matches, so the job stays closed until it is configured.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET

  return !!cronSecret && request.headers.get('authorization') === `Bearer ${cronSecret}`
}

/**
 * Turns down every pending invitation whose meeting date has passed.
 * One conditional update, so an invitation accepted in the meantime is left alone.
 * Returns the ids of the invitations it changed.
 */
export async function expireOutdatedOffers(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<string[]> {
  const timestamp = now.toISOString()

  const { data, error } = await supabase
    .from('meeting_invitations')
    .update({
      status: 'denied',
      updated_at: timestamp
    })
    .eq('status', 'pending')
    .lt('meeting_date', timestamp)
    .select('id')

  if (error) {
    throw error
  }

  return (data ?? []).map(row => row.id)
}
