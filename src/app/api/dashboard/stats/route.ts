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

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('Error fetching users count:', usersError)
    }

    // Get user's skills count
    const { count: userSkillsCount, error: userSkillsError } = await supabase
      .from('user_skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (userSkillsError) {
      console.error('Error fetching user skills count:', userSkillsError)
    }

    // Get user's conversations count
    const { count: conversationsCount, error: conversationsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

    if (conversationsError) {
      console.error('Error fetching conversations count:', conversationsError)
    }

    // Get user's messages count
    const { count: messagesCount, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', user.id)

    if (messagesError) {
      console.error('Error fetching messages count:', messagesError)
    }

    // Get user's meeting invitations count
    const { count: meetingsCount, error: meetingsError } = await supabase
      .from('meeting_invitations')
      .select('*', { count: 'exact', head: true })
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)

    if (meetingsError) {
      console.error('Error fetching meetings count:', meetingsError)
    }

    // Get user's profile data for location
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('location, experience_points, level')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
    }

    // Calculate estimated earnings (based on teaching skills and hourly rates)
    const { data: teachingSkills, error: teachingError } = await supabase
      .from('user_skills')
      .select('hourly_rate')
      .eq('user_id', user.id)
      .eq('can_teach', true)
      .not('hourly_rate', 'is', null)

    let estimatedEarnings = 0
    if (!teachingError && teachingSkills) {
      // Simple calculation: average hourly rate * 10 (estimated hours)
      const avgHourlyRate = teachingSkills.reduce((sum, skill) => sum + (skill.hourly_rate || 0), 0) / teachingSkills.length
      estimatedEarnings = avgHourlyRate * 10 // 10 estimated teaching hours
    }

    // Get offers statistics
    const { data: offersStats, error: offersStatsError } = await supabase
      .from('meeting_invitations')
      .select(`
        status,
        meeting_duration,
        inviter_id,
        skill:skills (
          hourly_rate
        )
      `)
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)

    let totalEarned = 0
    let totalSpent = 0
    let completedOffers = 0

    if (!offersStatsError && offersStats) {
      offersStats.forEach(offer => {
        if (offer.status === 'completed') {
          completedOffers++
          const isInviter = offer.inviter_id === user.id
          const skill = Array.isArray(offer.skill) ? offer.skill[0] : offer.skill
          const hourlyRate = skill?.hourly_rate || 0
          const durationHours = offer.meeting_duration / 60
          const amount = hourlyRate * durationHours

          if (isInviter) {
            totalEarned += amount
          } else {
            totalSpent += amount
          }
        }
      })
    }

    const stats = {
      totalUsers: totalUsers || 0,
      userSkills: userSkillsCount || 0,
      conversations: conversationsCount || 0,
      messages: messagesCount || 0,
      meetings: meetingsCount || 0,
      completedOffers: completedOffers,
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      location: userProfile?.location || 'Not set',
      experiencePoints: userProfile?.experience_points || 0,
      level: userProfile?.level || 1,
      estimatedEarnings: Math.round(estimatedEarnings)
    }

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
