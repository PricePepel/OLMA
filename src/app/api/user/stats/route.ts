import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse, createSuccessResponse, getAuthenticatedUser, errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    // Get user's basic profile stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        experience_points,
        personal_currency,
        level,
        streak_days
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, profileError.message)
    }

    // Get activity counts
    const [
      { count: postsCount },
      { count: skillOffersCount },
      { count: clubsCount },
      { count: eventsAttendedCount },
      { count: meetupsCompletedCount },
      { count: achievementsCount }
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      supabase.from('skill_offers').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      supabase.from('event_attendees').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      // For meetups completed, we'll use a placeholder since we don't have a specific table
      Promise.resolve({ count: 0 }),
      supabase.from('achievements_user').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
    ])

    const userStats = {
      experience_points: profile.experience_points,
      personal_currency: profile.personal_currency,
      level: profile.level,
      streak_days: profile.streak_days,
      posts_count: postsCount || 0,
      skill_offers_count: skillOffersCount || 0,
      clubs_count: clubsCount || 0,
      events_attended_count: eventsAttendedCount || 0,
      meetups_completed_count: meetupsCompletedCount || 0,
      achievements_count: achievementsCount || 0
    }

    return createSuccessResponse(userStats)

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


