import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequest, 
  checkRateLimit,
  errorHandlers 
} from '@/lib/api-helpers'
import { createReportSchema, ApiErrorCode } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Check rate limit
    if (!checkRateLimit(user.id, 'create_report', 3, 300000)) { // 3 reports per 5 minutes
      return errorHandlers.rateLimited()
    }

    const body = await request.json()
    
    // Validate request
    const validatedData = validateRequest(createReportSchema, body) as any

    const { target_type, target_id, reason, description } = validatedData

    // Check if user already reported this target
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return createErrorResponse(ApiErrorCode.DUPLICATE_ENTRY, 'You have already reported this content')
    }

    // Verify target exists
    let targetExists = false
    switch (target_type) {
      case 'post':
        const { data: post } = await supabase
          .from('posts')
          .select('id')
          .eq('id', target_id)
          .single()
        targetExists = !!post
        break
      case 'user':
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', target_id)
          .single()
        targetExists = !!profile
        break
      case 'club':
        const { data: club } = await supabase
          .from('clubs')
          .select('id')
          .eq('id', target_id)
          .single()
        targetExists = !!club
        break
      default:
        return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Invalid target type')
    }

    if (!targetExists) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Reported content not found')
    }

    // Create report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type,
        target_id,
        reason,
        description: description || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Report creation error:', insertError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to create report')
    }

    // Send notification to moderators (in a real app, this would be a background job)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_report',
          target_type,
          target_id,
          report_id: report.id
        })
      })
    } catch (notificationError) {
      console.error('Notification error:', notificationError)
      // Don't fail the report if notification fails
    }

    return createSuccessResponse({ report })

  } catch (error) {
    console.error('Report creation API error:', error)
    return errorHandlers.internalError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Check if user is a moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Moderator access required')
    }

    // Parse query parameters
    const status = searchParams.get('status') || 'pending'
    const targetType = searchParams.get('target_type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    // Build query
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (targetType) {
      query = query.eq('target_type', targetType)
    }

    // Apply cursor pagination
    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    // Execute query
    const { data: reports, error, count } = await query.limit(limit + 1)

    if (error) {
      console.error('Reports fetch error:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to fetch reports')
    }

    // Handle pagination
    const hasMore = reports && reports.length > limit
    const nextCursor = hasMore ? reports[limit - 1]?.created_at : null
    const finalReports = hasMore ? reports.slice(0, limit) : reports

    return createSuccessResponse({
      reports: finalReports,
      nextCursor
    }, undefined, 200, {
      total: count || 0,
      hasMore
    })

  } catch (error) {
    console.error('Reports API error:', error)
    return errorHandlers.internalError(error)
  }
}
