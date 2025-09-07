'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Search, 
  MoreVertical, 
  User, 
  MessageCircle,
  Clock,
  Check,
  CheckCheck,
  CalendarPlus,
  RefreshCw
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { MeetingInviteModal } from '@/components/meetings/meeting-invite-modal'
import { MeetingInvitationCard } from '@/components/meetings/meeting-invitation-card'
import { toast } from 'sonner'

interface Conversation {
  id: string
  created_at: string
  updated_at: string
  other_user: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  latest_message?: {
    id: string
    content: string
    created_at: string
    is_from_me: boolean
  }
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
}

export function MessagesComponent() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { 
    data: conversationsResponse, 
    isLoading: conversationsLoading, 
    error: conversationsError,
    refetch: refetchConversations 
  } = useApi<{data: Conversation[], total: number}>({
    url: '/api/messages/conversations',
    method: 'GET'
  })

  // Extract conversations array from response
  const conversations = conversationsResponse?.data || []

  // Debug logging for conversations
  useEffect(() => {
    console.log('MessagesComponent - conversations:', conversations)
    console.log('MessagesComponent - conversations type:', typeof conversations)
    console.log('MessagesComponent - conversations isArray:', Array.isArray(conversations))
    if (conversations) {
      console.log('MessagesComponent - conversations constructor:', conversations.constructor.name)
    }
  }, [conversations])

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useApi<Message[]>({
    url: selectedConversation ? `/api/messages/conversations/${selectedConversation.id}/messages` : '',
    method: 'GET',
    enabled: !!selectedConversation
  })

  // Fetch meeting invitations for the selected conversation
  const { data: meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useApi<any[]>({
    url: selectedConversation ? `/api/meetings?conversation_id=${selectedConversation.id}` : '',
    method: 'GET',
    enabled: !!selectedConversation
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Only refetch when user comes back to the page (no automatic polling)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && selectedConversation) {
        // Silently refresh data when user returns to the page
        refetchMessages()
        refetchConversations()
        refetchMeetings()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [selectedConversation, refetchMessages, refetchConversations, refetchMeetings])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      })

      if (response.ok) {
        setMessage('')
        refetchMessages()
        refetchConversations()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(conv => {
    if (!searchQuery) return true
    // Add safety check for other_user
    if (!conv.other_user) return false
    return conv.other_user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.other_user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversations</span>
            <Badge variant="secondary">{conversations?.length || 0}</Badge>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversationsLoading && (!conversations || conversations.length === 0) ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.other_user?.avatar_url} />
                            <AvatarFallback>
                              {conversation.other_user?.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.other_user?.full_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {conversation.latest_message && formatTime(conversation.latest_message.created_at)}
                            </span>
                          </div>
                          {conversation.latest_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.latest_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation by contacting someone from the skills directory
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.other_user?.avatar_url} />
                    <AvatarFallback>
                      {selectedConversation.other_user?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedConversation.other_user?.full_name}</CardTitle>
                    <CardDescription>@{selectedConversation.other_user?.username}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={async () => {
                      setIsRefreshing(true)
                      try {
                        await Promise.all([
                          refetchMessages(),
                          refetchConversations(),
                          refetchMeetings()
                        ])
                      } finally {
                        setIsRefreshing(false)
                      }
                    }}
                    disabled={isRefreshing}
                    title="Refresh messages"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] p-4">
                {/* Only show loading skeleton on initial load, not during refreshes */}
                {messagesLoading && (!messages || messages.length === 0) ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-end animate-pulse">
                        <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Display meeting invitations */}
                    {meetings && meetings.length > 0 && (
                      <div className="space-y-3">
                        {meetings.map((meeting) => (
                          <MeetingInvitationCard
                            key={meeting.id}
                            meeting={meeting}
                            onStatusChange={() => {
                              refetchMeetings()
                              refetchConversations()
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Display messages */}
                    {messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isOwnMessage = msg.sender_id === user?.id
                          return (
                            <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex items-end space-x-2 max-w-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                {!isOwnMessage && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={msg.sender.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                      {msg.sender.full_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className={`rounded-lg p-3 ${
                                  isOwnMessage 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}>
                                  <p className="text-sm">{msg.content}</p>
                                  <div className={`flex items-center space-x-1 mt-1 text-xs ${
                                    isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    <span>{formatTime(msg.created_at)}</span>
                                    {isOwnMessage && <CheckCheck className="h-3 w-3" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                          <p className="text-muted-foreground">
                            Start the conversation by sending a message
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMeetingModalOpen(true)}
                  title="Invite to meeting"
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Meeting Invite Modal */}
      {selectedConversation && (
        <MeetingInviteModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          conversationId={selectedConversation.id}
          otherUserId={selectedConversation.other_user.id}
          otherUserName={selectedConversation.other_user.full_name}
          onInviteSent={() => {
            refetchMeetings()
            refetchConversations()
          }}
        />
      )}
    </div>
  )
}
