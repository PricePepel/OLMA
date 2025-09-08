import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequest, 
  checkRateLimit, 
  buildSearchQuery, 
  buildCursorPagination,
  handleCursorPagination,
  errorHandlers 
} from '@/lib/api-helpers'
import { createPostSchema, ApiErrorCode } from '@/types/api'
import { filterContent } from '@/lib/safety'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '10')
    const cursor = searchParams.get('cursor')
    const search = searchParams.get('search')
    const authorId = searchParams.get('author_id')

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        _count:post_likes(count),
        is_liked:post_likes!inner(user_id)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`content.ilike.%${search}%`)
    }

    if (authorId) {
      query = query.eq('author_id', authorId)
    }

    // Apply cursor pagination
    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    // Execute query
    const { data: posts, error, count } = await query.limit(limit + 1)

    if (error) {
      console.error('Posts fetch error:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to fetch posts')
    }

    // Handle pagination
    const hasMore = posts && posts.length > limit
    const nextCursor = hasMore ? posts[limit - 1]?.created_at : null
    const finalPosts = hasMore ? posts.slice(0, limit) : posts

    // Transform data
    const transformedPosts = finalPosts?.map(post => ({
      ...post,
      _count: {
        likes: post._count?.[0]?.count || 0,
        comments: 0 // TODO: Add comments count
      },
      is_liked: post.is_liked?.length > 0
    })) || []

    return createSuccessResponse({
      posts: transformedPosts,
      nextCursor
    }, undefined, 200, {
      total: count || 0,
      hasMore
    })

  } catch (error) {
    console.error('Posts API error:', error)
    return errorHandlers.internalError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    // Check rate limit
    if (!checkRateLimit(user.id, 'create_post', 5, 60000)) { // 5 posts per minute
      return errorHandlers.rateLimited()
    }

    // Parse form data
    const formData = await request.formData()
    const content = formData.get('content') as string
    const image = formData.get('image') as File | null

    // Validate request
    const validatedData = validateRequest(createPostSchema, { content, mediaUrls: image ? [image.name] : [] }) as any

    // Safety filter content
    const filteredContent = filterContent(validatedData.content)
    if (!filteredContent.isClean) {
      return createErrorResponse(ApiErrorCode.CONTENT_VIOLATION, 'Content violates community guidelines')
    }

    let mediaUrl: string | null = null

    // Upload image if provided
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Image upload error:', uploadError)
        return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to upload image')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName)

      mediaUrl = publicUrl
    }

    // Create post
    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content: validatedData.content,
        media_url: mediaUrl,
        status: 'active'
      })
      .select(`
        *,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('Post creation error:', insertError)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to create post')
    }

    // Award XP for creating a post
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://ol-7csck29jz-ibrahimtleukulov-gmailcoms-projects.vercel.app'}/api/gamification/award-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'create_post',
          amount: 10
        })
      })
    } catch (xpError) {
      console.error('XP award error:', xpError)
      // Don't fail the post creation if XP award fails
    }

    return createSuccessResponse({
      post: {
        ...post,
        _count: { likes: 0, comments: 0 },
        is_liked: false
      }
    })

  } catch (error) {
    console.error('Post creation API error:', error)
    return errorHandlers.internalError(error)
  }
}
