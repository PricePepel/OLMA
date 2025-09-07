'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  User, 
  Star, 
  MapPin, 
  MessageCircle, 
  BookOpen,
  Users,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface SkillMatch {
  user: {
    id: string
    full_name: string
    username: string
    avatar_url: string
    location: string
    level: number
    experience_points: number
  }
  skill: {
    id: string
    name: string
    category: string
    description: string
  }
  userSkill: {
    proficiency_level: number
    hourly_rate: number | null
    can_teach: boolean
  }
}

export function SkillMatcher() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch skills the current user wants to learn
  const { data: userLearningSkillsResponse, isLoading: learningSkillsLoading } = useApi<any>({
    url: `/api/user-skills?user_id=${user?.id}`,
    enabled: !!user
  })

  // Extract the userSkills array from the API response
  const userLearningSkills = userLearningSkillsResponse?.userSkills || []

  // Fetch potential teachers for those skills
  const { data: skillMatchesResponse, isLoading: matchesLoading, refetch: refetchMatches, error: matchesError } = useApi<any>({
    url: '/api/user-skills/matches',
    enabled: !!user && Array.isArray(userLearningSkills) && userLearningSkills.length > 0
  })

  // Extract the matches array from the API response
  const skillMatches = skillMatchesResponse?.matches || []

  // Debug logging
  useEffect(() => {
    console.log('SkillMatcher Debug:', {
      user: !!user,
      userLearningSkills: userLearningSkills?.length || 0,
      skillMatches: skillMatches?.length || 0,
      matchesError: matchesError?.message
    })
  }, [user, userLearningSkills, skillMatches, matchesError])

  // Get unique categories from learning skills
  const categories = Array.isArray(userLearningSkills) 
    ? ['all', ...Array.from(new Set(userLearningSkills
        .filter(us => us.can_learn && us.skills)
        .map(us => us.skills.category)
      ))]
    : ['all']

  // Filter learning skills to only show those the user wants to learn
  const learningSkills = Array.isArray(userLearningSkills) 
    ? userLearningSkills.filter(us => us.can_learn && us.skills) 
    : []

  // Filter matches based on search and category
  const filteredMatches = Array.isArray(skillMatches) ? skillMatches.filter(match => {
    if (!match || !match.user || !match.skill) return false
    
    const matchesSearch = !searchQuery || 
      match.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.skill.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || match.skill.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }) : []

  const handleStartConversation = async (teacherId: string, skillName: string) => {
    try {
      // Create a conversation with the teacher
      const conversationResponse = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          other_user_id: teacherId
        }),
      })

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Failed to create conversation: ${conversationResponse.status}`)
      }

      const conversationResult = await conversationResponse.json()
      if (!conversationResult.success) {
        throw new Error(conversationResult.error?.message || 'Failed to create conversation')
      }

      const conversation = conversationResult.data
      
      // Send initial message
      const messageResponse = await fetch(`/api/messages/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `Hi! I'm interested in learning ${skillName}. Are you available to teach?`
        }),
      })

      if (!messageResponse.ok) {
        console.warn('Failed to send initial message, but conversation was created')
      }

      toast.success('Conversation started! Check your messages.')
      // Redirect to messages after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard/messages'
      }, 1500)
      
    } catch (error) {
      console.error('Conversation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create conversation')
    }
  }

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (level >= 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getProficiencyText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Elementary'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Unknown'
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Please log in</h3>
        <p className="text-muted-foreground">Sign in to find skill teachers</p>
      </div>
    )
  }

  if (learningSkillsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Check if user has any skills they want to learn
  if (learningSkills.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No skills to learn yet</h3>
        <p className="text-muted-foreground mb-4">
          Add skills you want to learn to find teachers
        </p>
        <Button onClick={() => window.location.href = '/dashboard/skills'}>
          Manage Skills
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Find Skill Teachers</h2>
        <p className="text-muted-foreground">
          Discover people who can teach the skills you want to learn
        </p>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
          <p className="text-sm text-blue-700">
            Learning Skills: {learningSkills.length} | 
            Matches Found: {skillMatches?.length || 0} | 
            Error: {matchesError?.message || 'None'}
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teachers or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-2 bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Skills Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Skills You Want to Learn
          </CardTitle>
          <CardDescription>
            {learningSkills.length} skill{learningSkills.length !== 1 ? 's' : ''} you're looking to learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(learningSkills) && learningSkills.map((userSkill) => (
              <Badge key={userSkill.id} variant="secondary">
                {userSkill.skill?.name || 'Unknown Skill'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Potential Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Potential Teachers
          </CardTitle>
          <CardDescription>
            {filteredMatches.length} teacher{filteredMatches.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <div key={`${match.user.id}-${match.skill.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.user.avatar_url} />
                      <AvatarFallback>
                        {match.user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{match.user.full_name}</h4>
                        <Badge variant="outline">@{match.user.username}</Badge>
                        <Badge className={getProficiencyColor(match.userSkill.proficiency_level)}>
                          {getProficiencyText(match.userSkill.proficiency_level)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>Level {match.user.level}</span>
                        </div>
                        {match.user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{match.user.location}</span>
                          </div>
                        )}
                        {match.userSkill.hourly_rate && (
                          <div className="flex items-center gap-1">
                            <span>💰 {match.userSkill.hourly_rate} currency/hr</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Badge variant="secondary" className="mr-2">
                          {match.skill.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {match.skill.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartConversation(match.user.id, match.skill.name)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or category filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
