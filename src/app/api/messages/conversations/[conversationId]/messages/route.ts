import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const { conversationId } = await params

    // Verify user is participant in conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Conversation not found')
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Access denied to this conversation')
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        sender:users!messages_sender_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, messagesError.message)
    }

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    return createSuccessResponse(messages || [])

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()
    const { conversationId } = await params

    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Message content is required')
    }

    // Verify user is participant in conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Conversation not found')
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Access denied to this conversation')
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        sender_id,
        sender:users!messages_sender_id_fkey (
          id,
          full_name,
          username,
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
      .eq('id', conversationId)

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
