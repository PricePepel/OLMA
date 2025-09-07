'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Plus, 
  Users, 
  Calendar,
  MapPin,
  Star,
  BookOpen,
  Settings,
  MessageCircle,
  Loader2,
  Building2,
  Clock,
  Filter,
  Grid3X3,
  List,
  Eye,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Club, Event } from '@/types/database'

interface ClubWithDetails extends Club {
  creator: {
    id: string
    full_name: string
    username: string
    avatar_url: string | null
  }
  member_count: number
  event_count: number
  user_membership?: {
    role: 'owner' | 'moderator' | 'member'
    joined_at: string
  } | null
}

interface CreateClubData {
  name: string
  description: string
  category: string
  location: string
  is_public: boolean
  max_members?: number
}

interface CreateEventData {
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  max_attendees?: number
}

const CLUB_CATEGORIES = [
  'Technology',
  'Arts',
  'Sports',
  'Music',
  'Gaming',
  'Education',
  'Business',
  'Lifestyle',
  'Health',
  'Food',
  'Travel',
  'Other'
]

export function ClubsComponent() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateClubDialogOpen, setIsCreateClubDialogOpen] = useState(false)
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState<ClubWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [createClubData, setCreateClubData] = useState<CreateClubData>({
    name: '',
    description: '',
    category: '',
    location: '',
    is_public: true
  })
  
  const [createEventData, setCreateEventData] = useState<CreateEventData>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    max_attendees: 10
  })

  // Debounce search query
  const debouncedSearchQuery = useMemo(() => {
    const timeoutId = setTimeout(() => {}, 300)
    return searchQuery
  }, [searchQuery])

  // Build API URL with filters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (debouncedSearchQuery) params.append('q', debouncedSearchQuery)
    if (selectedCategory) params.append('category', selectedCategory)
    if (selectedTab === 'my') params.append('tab', 'my')
    return `/api/clubs?${params.toString()}`
  }, [debouncedSearchQuery, selectedCategory, selectedTab])

  const { 
    data: clubsResponse, 
    isLoading: clubsLoading, 
    refetch: refetchClubs,
    error: clubsError 
  } = useApi<{ data: ClubWithDetails[]; total: number; hasMore: boolean }>({
    url: apiUrl,
    method: 'GET',
    enabled: true
  })

  const clubs = clubsResponse?.data || []

  const handleCreateClub = async () => {
    if (!user) {
      toast.error('You must be logged in to create a club')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createClubData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Club created successfully!')
        setIsCreateClubDialogOpen(false)
        setCreateClubData({
          name: '',
          description: '',
          category: '',
          location: '',
          is_public: true
        })
        refetchClubs()
      } else {
        throw new Error(result.error?.message || 'Failed to create club')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create club')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinClub = async (clubId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a club')
      return
    }

    try {
      const response = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Joined club successfully!')
        refetchClubs()
      } else {
        throw new Error(result.error?.message || 'Failed to join club')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join club')
    }
  }

  const handleLeaveClub = async (clubId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/clubs/${clubId}/leave`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Left club successfully!')
        refetchClubs()
      } else {
        throw new Error(result.error?.message || 'Failed to leave club')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to leave club')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Arts': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-green-100 text-green-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Business': 'bg-gray-100 text-gray-800',
      'Other': 'bg-slate-100 text-slate-800'
    }
    return colors[category] || colors['Other']
  }

  const ClubCard = ({ club }: { club: ClubWithDetails }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {club.avatar_url ? (
          <img
            src={club.avatar_url}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-12 w-12 text-white" />
          </div>
        )}
        {club.user_membership && (
          <Badge className="absolute top-2 right-2 bg-white/90 text-gray-900">
            {club.user_membership.role}
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{club.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {club.description}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          {!club.is_public && (
            <Badge variant="outline" className="text-xs">
              Private
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{club.member_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{club.event_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(club.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={club.creator.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {club.creator.full_name?.charAt(0) || club.creator.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            by {club.creator.full_name || club.creator.username}
          </span>
        </div>
        
        <div className="flex gap-2">
          {club.user_membership ? (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              {club.user_membership.role !== 'owner' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleLeaveClub(club.id)}
                >
                  Leave
                </Button>
              )}
            </>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleJoinClub(club.id)}
            >
              <Users className="h-4 w-4 mr-2" />
              Join Club
            </Button>
          )}
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ClubSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {CLUB_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Dialog open={isCreateClubDialogOpen} onOpenChange={setIsCreateClubDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Club
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Club</DialogTitle>
                  <DialogDescription>
                    Start a club to bring together people with similar interests
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="club_name">Club Name *</Label>
                    <Input
                      id="club_name"
                      value={createClubData.name}
                      onChange={(e) => setCreateClubData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter club name"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="club_category">Category *</Label>
                    <Select value={createClubData.category} onValueChange={(value) => setCreateClubData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUB_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="club_description">Description</Label>
                    <Textarea
                      id="club_description"
                      value={createClubData.description}
                      onChange={(e) => setCreateClubData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your club..."
                      rows={3}
                      maxLength={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club_location">Location</Label>
                    <Input
                      id="club_location"
                      value={createClubData.location}
                      onChange={(e) => setCreateClubData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      maxLength={100}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={createClubData.is_public}
                      onChange={(e) => setCreateClubData(prev => ({ ...prev, is_public: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_public">Public club (anyone can join)</Label>
                  </div>

                  <Button 
                    onClick={handleCreateClub} 
                    disabled={!createClubData.name || !createClubData.category || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Club'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="my">My Clubs</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          
          {/* Content */}
          <TabsContent value={selectedTab} className="mt-6">
        {clubsError ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">Error loading clubs</div>
            <Button onClick={() => refetchClubs()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : clubsLoading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ClubSkeleton key={i} />
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filters'
                : 'Be the first to create a club in this category!'
              }
            </p>
            <Button onClick={() => setIsCreateClubDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Club
            </Button>
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
