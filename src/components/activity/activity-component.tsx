'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity,
  Calendar,
  Users,
  MessageCircle,
  Star,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Building2
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'

interface ActivityItem {
  id: string
  type: 'post' | 'event' | 'club' | 'message' | 'achievement'
  title: string
  description: string
  timestamp: string
  metadata?: {
    club_name?: string
    event_title?: string
    achievement_name?: string
    points?: number
  }
}

interface Stats {
  total_posts: number
  total_events: number
  total_clubs: number
  total_messages: number
  total_achievements: number
  streak_days: number
  experience_points: number
  level: number
}

export function ActivityComponent() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('recent')

  // Mock data for now - in a real app, you'd fetch this from API
  const mockActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'post',
      title: 'Created a new post',
      description: 'Shared thoughts about the latest club meeting',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metadata: {
        club_name: 'Tech Enthusiasts'
      }
    },
    {
      id: '2',
      type: 'event',
      title: 'Joined an event',
      description: 'Registered for the upcoming workshop',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      metadata: {
        event_title: 'Web Development Workshop'
      }
    },
    {
      id: '3',
      type: 'club',
      title: 'Joined a club',
      description: 'Became a member of a new community',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      metadata: {
        club_name: 'Photography Club'
      }
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Earned an achievement',
      description: 'Unlocked a new badge for participation',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      metadata: {
        achievement_name: 'First Post',
        points: 50
      }
    }
  ]

  const mockStats: Stats = {
    total_posts: 12,
    total_events: 8,
    total_clubs: 3,
    total_messages: 45,
    total_achievements: 5,
    streak_days: 7,
    experience_points: 1250,
    level: 3
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post':
        return <MessageCircle className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'club':
        return <Building2 className="h-4 w-4" />
      case 'message':
        return <MessageCircle className="h-4 w-4" />
      case 'achievement':
        return <Award className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'club':
        return 'bg-purple-100 text-purple-800'
      case 'message':
        return 'bg-orange-100 text-orange-800'
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total_posts}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total_events}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs Joined</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total_clubs}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.experience_points}</div>
            <p className="text-xs text-muted-foreground">
              Level {mockStats.level}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {mockActivity.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-full ${getActivityColor(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.metadata && (
                      <div className="flex items-center space-x-2">
                        {item.metadata.club_name && (
                          <Badge variant="secondary" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            {item.metadata.club_name}
                          </Badge>
                        )}
                        {item.metadata.event_title && (
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.metadata.event_title}
                          </Badge>
                        )}
                        {item.metadata.achievement_name && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {item.metadata.achievement_name}
                          </Badge>
                        )}
                        {item.metadata.points && (
                          <Badge variant="outline" className="text-xs">
                            +{item.metadata.points} XP
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4" />
                <p>Achievements will be displayed here</p>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Current Streak</span>
                      <span className="font-medium">{mockStats.streak_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Messages</span>
                      <span className="font-medium">{mockStats.total_messages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Achievements Earned</span>
                      <span className="font-medium">{mockStats.total_achievements}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Level Progress</span>
                        <span className="font-medium">{mockStats.level}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(mockStats.experience_points % 500) / 5}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mockStats.experience_points} / {mockStats.level * 500} XP
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}





