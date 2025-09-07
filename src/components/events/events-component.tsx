'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { Event, Club } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin, Users, Plus, Search, Filter, Grid, List } from 'lucide-react'
import { toast } from 'sonner'

interface EventWithDetails extends Event {
  creator: {
    id: string
    full_name: string
    username: string
    avatar_url?: string
  }
  club?: {
    id: string
    name: string
    avatar_url?: string
  }
  attendee_count: number
  user_attendance?: {
    status: string
  }
}

const EVENT_CATEGORIES = [
  'Workshop',
  'Meetup',
  'Conference',
  'Training',
  'Social',
  'Educational',
  'Networking',
  'Other'
]

export function EventsComponent() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [createEventData, setCreateEventData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    max_attendees: '',
    club_id: ''
  })

  // Fetch events
  const { data: events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useApi<EventWithDetails[]>({
    url: `/api/events?q=${searchQuery}&category=${selectedCategory}`,
    enabled: true
  })

  // Fetch user's clubs for event creation
  const { data: userClubs } = useApi<Club[]>({
    url: '/api/clubs?tab=my',
    enabled: !!user
  })

  const handleCreateEvent = async () => {
    if (!user) {
      toast.error('You must be logged in to create an event')
      return
    }

    if (!createEventData.title || !createEventData.start_time || !createEventData.end_time) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createEventData,
          max_attendees: createEventData.max_attendees ? parseInt(createEventData.max_attendees) : null,
          club_id: createEventData.club_id || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create event')
      }

      toast.success('Event created successfully!')
      setIsCreateDialogOpen(false)
      setCreateEventData({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        max_attendees: '',
        club_id: ''
      })
      refetchEvents()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      toast.error('You must be logged in to join an event')
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to join event')
      }

      toast.success('Successfully joined event!')
      refetchEvents()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join event')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = (event: EventWithDetails) => {
    const now = new Date()
    const startTime = new Date(event.start_time)
    const endTime = new Date(event.end_time)

    if (now < startTime) return 'upcoming'
    if (now >= startTime && now <= endTime) return 'ongoing'
    return 'past'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'past': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const EventCard = ({ event }: { event: EventWithDetails }) => {
    const status = getEventStatus(event)
    const isAttending = event.user_attendance?.status === 'confirmed'

    return (
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={event.club?.avatar_url || event.creator.avatar_url} />
                <AvatarFallback>
                  {event.club?.name?.charAt(0) || event.creator.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  by {event.creator.full_name}
                  {event.club && ` • ${event.club.name}`}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
                             <span>{event.current_participants} attending</span>
              {event.max_participants && (
                <span className="text-muted-foreground">/ {event.max_participants}</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isAttending && status === 'upcoming' && (
              <Button 
                size="sm" 
                onClick={() => handleJoinEvent(event.id)}
                className="flex-1"
              >
                Join Event
              </Button>
            )}
            {isAttending && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                disabled
              >
                Already Joined
              </Button>
            )}
            {status === 'past' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                disabled
              >
                Event Ended
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const EventSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Create an event to bring people together around shared interests.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={createEventData.title}
                    onChange={(e) => setCreateEventData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={createEventData.description}
                    onChange={(e) => setCreateEventData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                      type="datetime-local"
                      value={createEventData.start_time}
                      onChange={(e) => setCreateEventData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time *</label>
                    <Input
                      type="datetime-local"
                      value={createEventData.end_time}
                      onChange={(e) => setCreateEventData(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={createEventData.location}
                    onChange={(e) => setCreateEventData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Max Attendees</label>
                    <Input
                      type="number"
                      value={createEventData.max_attendees}
                      onChange={(e) => setCreateEventData(prev => ({ ...prev, max_attendees: e.target.value }))}
                      placeholder="No limit"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Club (Optional)</label>
                    <Select 
                      value={createEventData.club_id} 
                      onValueChange={(value) => setCreateEventData(prev => ({ ...prev, club_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a club" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No club</SelectItem>
                        {userClubs?.map((club) => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Events Grid/List */}
      {eventsLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      ) : eventsError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Failed to load events</p>
            <Button onClick={() => refetchEvents()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : !events || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filters'
                : 'Be the first to create an event in your community!'
              }
            </p>
            {!searchQuery && !selectedCategory && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

