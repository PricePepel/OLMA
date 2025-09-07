import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessageSchema } from '@/types/api'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  validateRequest,
  checkRateLimit,
  buildCursorPagination,
  handleCursorPagination,
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams
    const conversationId = params.get('conversationId')
    const cursor = params.get('cursor')
    const limit = parseInt(params.get('limit') || '20')

    if (!conversationId) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Conversation ID is required')
    }

    const { user, supabase } = await getAuthenticatedUser()

    // Verify user is participant in conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('profile_id', user.id)
      .single()
    
    if (!participant) {
      return errorHandlers.forbidden()
    }

    // Build query with cursor pagination
    let query = supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_profile_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)

    query = buildCursorPagination(
      query,
      cursor || undefined,
      limit,
      'created_at',
      'desc'
    )

    const { data: messages, error } = await query

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Handle pagination
    const { data: items, hasMore, cursor: nextCursor } = handleCursorPagination(messages, limit)

    // Mark messages as read for the current user
    if (items.length > 0) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('profile_id', user.id)
        .eq('read', false)
    }

    return createSuccessResponse({
      data: items,
      total: items.length,
      page: 1,
      limit,
      hasMore,
      cursor: nextCursor
    })

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequest(sendMessageSchema, body) as any
    
    const { user, supabase } = await getAuthenticatedUser()

    // Check rate limit
    if (!checkRateLimit(user.id, 'send_message', 20, 60000)) { // 20 messages per minute
      return errorHandlers.rateLimited()
    }

    // Verify user is participant in conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', validatedData.conversationId)
      .eq('profile_id', user.id)
      .single()

    if (!participant) {
      return errorHandlers.forbidden()
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: validatedData.conversationId,
        profile_id: user.id,
        content: validatedData.content,
        read: false
      })
      .select(`
        *,
        profiles!messages_profile_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (messageError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, messageError.message)
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', validatedData.conversationId)

    // TODO: Send push notification to other participants
    // This would typically involve:
    // 1. Getting other participants
    // 2. Checking their notification preferences
    // 3. Sending push notifications via a service like Firebase

    return createSuccessResponse(message, 'Message sent successfully', 201)

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
