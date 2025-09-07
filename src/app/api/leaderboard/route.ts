import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse, createSuccessResponse, getAuthenticatedUser, errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const params = new URL(request.url).searchParams
    
    const period = params.get('period') || 'week'
    const category = params.get('category') || 'overall'
    const limit = parseInt(params.get('limit') || '20')

    let query = supabase
      .from('leaderboard_snapshots')
      .select(`
        *,
        profile:profiles (
          id,
          full_name,
          username,
          avatar_url,
          level,
          experience_points,
          personal_currency,
          streak_days
        )
      `)
      .order('points', { ascending: false })
      .limit(limit)

    // Apply period filter
    if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('snapshot_date', weekAgo.toISOString().split('T')[0])
    } else if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('snapshot_date', monthAgo.toISOString().split('T')[0])
    }
    // For 'all' time, no date filter needed

    const { data: leaderboardData, error } = await query

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Calculate ranks and filter by category if needed
    let processedData = leaderboardData || []
    
    if (category !== 'overall') {
      // For specific categories, we need to calculate points differently
      processedData = await Promise.all(
        (leaderboardData || []).map(async (entry) => {
          let categoryPoints = 0
          
          switch (category) {
            case 'experience':
              categoryPoints = entry.profile.experience_points
              break
            case 'currency':
              categoryPoints = entry.profile.personal_currency
              break
            case 'achievements':
              // Count achievements
              const { count } = await supabase
                .from('achievements_user')
                .select('*', { count: 'exact', head: true })
                .eq('profile_id', entry.profile_id)
              categoryPoints = count || 0
              break
            case 'streak':
              categoryPoints = entry.profile.streak_days
              break
            default:
              categoryPoints = entry.points
          }
          
          return {
            ...entry,
            points: categoryPoints
          }
        })
      )
      
      // Re-sort by category points
      processedData.sort((a, b) => b.points - a.points)
    }

    // Add ranks
    const leaderboardWithRanks = processedData.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    return createSuccessResponse(leaderboardWithRanks)

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
