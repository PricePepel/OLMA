import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse, createSuccessResponse, getAuthenticatedUser, errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return createErrorResponse(
        ApiErrorCode.FORBIDDEN,
        'Access denied. Admin privileges required.'
      )
    }

    // Get basic stats
    const [
      { count: totalReports },
      { count: openReports },
      { count: resolvedReports },
      { count: bannedUsers },
      { count: hiddenContent }
    ] = await Promise.all([
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_hidden', true)
    ])

    // Get reports by type
    const { data: reportsByType } = await supabase
      .from('reports')
      .select('target_type')
      .then(result => {
        if (!result.data) return { data: [] }
        
        const typeCounts = result.data.reduce((acc, report) => {
          acc[report.target_type] = (acc[report.target_type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return {
          data: Object.entries(typeCounts).map(([type, count]) => ({ type, count }))
        }
      })

    // Get reports by status
    const { data: reportsByStatus } = await supabase
      .from('reports')
      .select('status')
      .then(result => {
        if (!result.data) return { data: [] }
        
        const statusCounts = result.data.reduce((acc, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return {
          data: Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
        }
      })

    // Get reports timeline (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: timelineData } = await supabase
      .from('reports')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    const reportsTimeline = timelineData ? 
      timelineData.reduce((acc, report) => {
        const date = new Date(report.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>) : {}

    const timeline = Object.entries(reportsTimeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const stats = {
      total_reports: totalReports || 0,
      open_reports: openReports || 0,
      resolved_reports: resolvedReports || 0,
      banned_users: bannedUsers || 0,
      hidden_content: hiddenContent || 0,
      reports_by_type: reportsByType || [],
      reports_by_status: reportsByStatus || [],
      reports_timeline: timeline
    }

    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching moderation stats:', error)
    return errorHandlers.internalError(error)
  }
}
