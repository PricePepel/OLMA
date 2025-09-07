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

    // Get conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:users!conversations_user1_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        user2:users!conversations_user2_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Transform conversations to include the other user and latest message
    const transformedConversations = await Promise.all(
      conversations?.map(async (conversation) => {
        const otherUser = conversation.user1_id === user.id 
          ? conversation.user2 
          : conversation.user1
        
        // Get the latest message for this conversation
        const { data: latestMessages, error: messagesError } = await supabase
          .from('messages')
          .select('id, content, created_at, sender_id')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        const latestMessage = latestMessages?.[0]
        
        return {
          id: conversation.id,
          other_user: otherUser,
          latest_message: latestMessage ? {
            id: latestMessage.id,
            content: latestMessage.content,
            created_at: latestMessage.created_at,
            is_from_me: latestMessage.sender_id === user.id
          } : null,
          created_at: conversation.created_at,
          updated_at: latestMessage?.created_at || conversation.created_at
        }
      }) || []
    )

    // Sort conversations by the latest message time
    const sortedConversations = transformedConversations.sort((a, b) => {
      const aTime = a.latest_message?.created_at || a.created_at
      const bTime = b.latest_message?.created_at || b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return createSuccessResponse({
      data: sortedConversations,
      total: sortedConversations.length
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
    const { user, supabase } = await getAuthenticatedUser()

    // Validate required fields
    if (!body.other_user_id) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Other user ID is required')
    }

    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${body.other_user_id}),and(user1_id.eq.${body.other_user_id},user2_id.eq.${user.id})`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, checkError.message)
    }

    if (existingConversation) {
      return createSuccessResponse(existingConversation, 'Conversation already exists')
    }

    // Create new conversation
    const { data: conversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        user1_id: user.id,
        user2_id: body.other_user_id
      })
      .select(`
        *,
        user1:users!conversations_user1_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        user2:users!conversations_user2_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, createError.message)
    }

    return createSuccessResponse(conversation, 'Conversation created successfully', 201)

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
