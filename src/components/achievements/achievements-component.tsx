'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  Crown, 
  Award, 
  Zap, 
  Target, 
  TrendingUp,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { ACHIEVEMENTS, AchievementId, getLevelTitle } from '@/lib/gamification'

interface UserAchievement {
  id: string
  profile_id: string
  achievement_id: string
  earned_at: string
  achievement: {
    id: string
    name: string
    description: string
    type: string
    points: number
    icon_url?: string
  }
}

interface UserStats {
  experience_points: number
  personal_currency: number
  level: number
  streak_days: number
  posts_count: number
  skill_offers_count: number
  clubs_count: number
  events_attended_count: number
  meetups_completed_count: number
}

interface AchievementsComponentProps {
  className?: string
}

export function AchievementsComponent({ className }: AchievementsComponentProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [achievementProgress, setAchievementProgress] = useState<Record<string, { earned: boolean; progress: number; total: number }>>({})

  const { data: userAchievements, isLoading: achievementsLoading } = useApi<UserAchievement[]>({
    url: '/api/achievements/user',
    method: 'GET'
  })

  const { data: statsData, isLoading: statsLoading } = useApi<UserStats>({
    url: '/api/user/stats',
    method: 'GET'
  })

  useEffect(() => {
    if (statsData) {
      setUserStats(statsData)
    }
  }, [statsData])

  useEffect(() => {
    if (userStats && userAchievements) {
      const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id)
      
      const progress: Record<string, { earned: boolean; progress: number; total: number }> = {}
      
      ACHIEVEMENTS.forEach((achievement) => {
        const earned = earnedAchievementIds.includes(achievement.id)
        let progressValue = 0
        let total = 1
        
        switch (achievement.id as AchievementId) {
          case 'first_post':
            progressValue = Math.min(userStats.posts_count, 1)
            total = 1
            break
          case 'first_meetup':
            progressValue = Math.min(userStats.meetups_completed_count, 1)
            total = 1
            break
          case 'seven_day_streak':
            progressValue = Math.min(userStats.streak_days, 7)
            total = 7
            break
          case 'thirty_day_streak':
            progressValue = Math.min(userStats.streak_days, 30)
            total = 30
            break
          case 'skill_master':
            progressValue = Math.min(userStats.skill_offers_count, 10)
            total = 10
            break
          case 'currency_collector':
            progressValue = Math.min(userStats.personal_currency, 1000)
            total = 1000
            break
          case 'social_butterfly':
            progressValue = Math.min(userStats.clubs_count, 5)
            total = 5
            break
          case 'helper':
            progressValue = Math.min(userStats.meetups_completed_count, 5)
            total = 5
            break
          default:
            progressValue = earned ? 1 : 0
            total = 1
        }
        
        progress[achievement.id] = {
          earned,
          progress: progressValue,
          total
        }
      })
      
      setAchievementProgress(progress)
    }
  }, [userStats, userAchievements])

  const getAchievementIcon = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return <Star className="h-6 w-6" />
    
    switch (achievementId) {
      case 'first_post':
        return <Target className="h-6 w-6" />
      case 'first_meetup':
        return <CheckCircle className="h-6 w-6" />
      case 'seven_day_streak':
      case 'thirty_day_streak':
        return <Zap className="h-6 w-6" />
      case 'skill_master':
        return <Award className="h-6 w-6" />
      case 'currency_collector':
        return <Crown className="h-6 w-6" />
      case 'social_butterfly':
        return <TrendingUp className="h-6 w-6" />
      case 'helper':
        return <CheckCircle className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'skill_teaching':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'skill_learning':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'club_creation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'event_attendance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'streak':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'currency_earned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getAchievementTypeLabel = (type: string) => {
    switch (type) {
      case 'skill_teaching':
        return 'Teaching'
      case 'skill_learning':
        return 'Learning'
      case 'club_creation':
        return 'Community'
      case 'event_attendance':
        return 'Events'
      case 'streak':
        return 'Consistency'
      case 'currency_earned':
        return 'Economy'
      default:
        return 'General'
    }
  }

  const earnedAchievements = userAchievements || []
  const totalAchievements = ACHIEVEMENTS.length
  const earnedCount = earnedAchievements.length
  const completionPercentage = Math.round((earnedCount / totalAchievements) * 100)

  const achievementsByType = {
    all: ACHIEVEMENTS,
    skill_teaching: ACHIEVEMENTS.filter(a => a.type === 'skill_teaching'),
    skill_learning: ACHIEVEMENTS.filter(a => a.type === 'skill_learning'),
    club_creation: ACHIEVEMENTS.filter(a => a.type === 'club_creation'),
    event_attendance: ACHIEVEMENTS.filter(a => a.type === 'event_attendance'),
    streak: ACHIEVEMENTS.filter(a => a.type === 'streak'),
    currency_earned: ACHIEVEMENTS.filter(a => a.type === 'currency_earned')
  }

  if (achievementsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Stats Overview */}
      {userStats && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.level}</div>
                <div className="text-sm text-muted-foreground">{getLevelTitle(userStats.level)}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.experience_points.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Experience Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{userStats.personal_currency.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Personal Currency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{userStats.streak_days}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievement Progress</span>
          </CardTitle>
          <CardDescription>
            Track your progress towards earning all achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {earnedCount} / {totalAchievements} ({completionPercentage}%)
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{userStats?.posts_count || 0}</div>
                <div className="text-xs text-muted-foreground">Posts Created</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{userStats?.meetups_completed_count || 0}</div>
                <div className="text-xs text-muted-foreground">Meetups Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{userStats?.clubs_count || 0}</div>
                <div className="text-xs text-muted-foreground">Clubs Joined</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{userStats?.events_attended_count || 0}</div>
                <div className="text-xs text-muted-foreground">Events Attended</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="skill_teaching">Teaching</TabsTrigger>
          <TabsTrigger value="skill_learning">Learning</TabsTrigger>
          <TabsTrigger value="club_creation">Community</TabsTrigger>
          <TabsTrigger value="event_attendance">Events</TabsTrigger>
          <TabsTrigger value="streak">Consistency</TabsTrigger>
          <TabsTrigger value="currency_earned">Economy</TabsTrigger>
        </TabsList>

        {Object.entries(achievementsByType).map(([category, categoryAchievements]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryAchievements.map((achievement) => {
                const progress = achievementProgress[achievement.id] || { earned: false, progress: 0, total: 1 }
                const progressPercentage = progress.total > 0 ? (progress.progress / progress.total) * 100 : 0

                return (
                  <Card key={achievement.id} className={`relative overflow-hidden ${progress.earned ? 'ring-2 ring-green-500' : ''}`}>
                    {progress.earned && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${progress.earned ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {getAchievementIcon(achievement.id)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                            <Badge className={getAchievementTypeColor(achievement.type)}>
                              {getAchievementTypeLabel(achievement.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        {achievement.description}
                      </p>

                      {!progress.earned && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{progress.progress} / {progress.total}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.rewards.xp} XP</span>
                        </div>
                        
                        {progress.earned ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">In Progress</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Empty State */}
      {earnedCount === 0 && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements earned yet</h3>
            <p className="text-muted-foreground">
              Start posting, completing meetups, and maintaining streaks to earn your first achievements!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
