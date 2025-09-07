'use client'

import { useState, useRef, useCallback } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Share2,
  Flag,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { formatRelativeTime, truncateText, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { createPostSchema, type Post, type CreatePostRequest } from '@/types/api'

interface PostWithAuthor extends Post {
  author: {
    id: string
    username: string
    fullName: string
    avatarUrl?: string
  }
  _count: {
    likes: number
    comments: number
  }
  isLiked: boolean
}

export function FeedComponent() {
  const [isComposing, setIsComposing] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set())

  // Fetch posts with infinite scroll
  const {
    data: postsData,
    isLoading,
    error,
    refetch
  } = useApi<{ posts: PostWithAuthor[], nextCursor?: string }>({
    url: '/api/posts?limit=10',
    method: 'GET'
  })

  const posts = postsData?.posts || []

  // Create new post
  const handleSubmitPost = async () => {
    if (!newPost.trim() && !selectedImage) {
      toast.error('Please enter some content or select an image')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content', newPost.trim())
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create post')
      }

      toast.success('Post created successfully!')
      setNewPost('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsComposing(false)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Like/unlike post
  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        refetch()
      }
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  // Report post
  const handleReport = async (postId: string) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'post',
          target_id: postId,
          reason: 'inappropriate_content'
        })
      })
      
      if (response.ok) {
        toast.success('Post reported successfully')
      }
    } catch (error) {
      toast.error('Failed to report post')
    }
  }

  // Hide/show post
  const handleToggleVisibility = (postId: string) => {
    setHiddenPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // Load more posts (infinite scroll)
  const loadMore = useCallback(() => {
    if (postsData?.nextCursor && !isLoading) {
      // In a real implementation, you'd fetch more posts here
      // For now, we'll just refetch
      refetch()
    }
  }, [postsData?.nextCursor, isLoading, refetch])

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load posts. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Compose Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/api/user/avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />
              
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
                
                <Button
                  onClick={handleSubmitPost}
                  disabled={(!newPost.trim() && !selectedImage) || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts yet. Be the first to share something!
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className={hiddenPosts.has(post.id) ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                                              <AvatarImage src={post.author.avatarUrl} />
                      <AvatarFallback>
                                                  {getInitials(post.author.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{post.author.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                                                  @{post.author.username} • {formatRelativeTime(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Post Options</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleToggleVisibility(post.id)}
                        >
                          {hiddenPosts.has(post.id) ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Show Post
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide Post
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleReport(post.id)}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report Post
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {!hiddenPosts.has(post.id) && (
                  <>
                    <div className="mb-4">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                    </div>
                    
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mb-4">
                                                  <img
                            src={post.mediaUrls[0]}
                          alt="Post media"
                          className="rounded-lg max-w-full"
                        />
                      </div>
                    )}
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={post.isLiked ? 'text-red-500' : ''}
                        >
                                                      <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post._count.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post._count.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
        
        {postsData?.nextCursor && (
          <div className="flex justify-center py-4">
            <Button variant="outline" onClick={loadMore} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
