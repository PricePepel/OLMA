import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse, errorHandlers } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Check if post exists and is active
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, status')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Post not found')
    }

    if (post.status !== 'active') {
      return createErrorResponse(ApiErrorCode.FORBIDDEN, 'Post is not available')
    }

    // Check if user already liked the post
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (unlikeError) {
        console.error('Unlike error:', unlikeError)
        return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to unlike post')
      }

      return createSuccessResponse({ liked: false })
    } else {
      // Like the post
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (likeError) {
        console.error('Like error:', likeError)
        return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to like post')
      }

      // Award XP for liking a post
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gamification/award-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'like_post',
            amount: 1
          })
        })
      } catch (xpError) {
        console.error('XP award error:', xpError)
        // Don't fail the like if XP award fails
      }

      return createSuccessResponse({ liked: true })
    }

  } catch (error) {
    console.error('Post like API error:', error)
    return errorHandlers.internalError(error)
  }
}
