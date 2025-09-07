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

    // Get all leaderboard entries for the period
    let query = supabase
      .from('leaderboard_snapshots')
      .select('profile_id, points')
      .order('points', { ascending: false })

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

    const { data: leaderboardData, error } = await query

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Find user's rank
    let userRank = null
    if (leaderboardData) {
      const userIndex = leaderboardData.findIndex(entry => entry.profile_id === user.id)
      if (userIndex !== -1) {
        userRank = userIndex + 1
      }
    }

    // If user not found in leaderboard, they might not have any activity
    if (userRank === null) {
      return createSuccessResponse({ rank: null })
    }

    return createSuccessResponse({ rank: userRank })

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


