'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown, 
  TrendingUp, 
  Users, 
  Calendar,
  Award,
  Zap,
  Target,
  Coins,
  Info
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { getLevelTitle, formatCurrency, formatExperience } from '@/lib/gamification'

interface LeaderboardEntry {
  id: string
  profile_id: string
  points: number
  rank: number
  snapshot_date: string
  profile: {
    id: string
    full_name: string
    username: string
    avatar_url?: string
    level: number
    experience_points: number
    personal_currency: number
    streak_days: number
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
  achievements_count: number
}

interface LeaderboardComponentProps {
  className?: string
}

export function LeaderboardComponent({ className }: LeaderboardComponentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'experience' | 'currency' | 'achievements' | 'streak'>('overall')
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  const { data: leaderboardData, isLoading: leaderboardLoading } = useApi<LeaderboardEntry[]>({
    url: `/api/leaderboard?period=${selectedPeriod}&category=${selectedCategory}`,
    method: 'GET'
  })

  const { data: userStatsData, isLoading: userStatsLoading } = useApi<UserStats>({
    url: '/api/user/stats',
    method: 'GET'
  })

  const { data: userRankData, isLoading: userRankLoading } = useApi<{ rank: number }>({
    url: `/api/leaderboard/rank?period=${selectedPeriod}&category=${selectedCategory}`,
    method: 'GET'
  })

  useEffect(() => {
    if (userStatsData) {
      setUserStats(userStatsData)
    }
  }, [userStatsData])

  useEffect(() => {
    if (userRankData) {
      setUserRank(userRankData.rank)
    }
  }, [userRankData])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-blue-500" />
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 2:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 3:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'overall':
        return <Trophy className="h-5 w-5" />
      case 'experience':
        return <Target className="h-5 w-5" />
      case 'currency':
        return <Coins className="h-5 w-5" />
      case 'achievements':
        return <Award className="h-5 w-5" />
      case 'streak':
        return <Zap className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'overall':
        return 'Overall Score'
      case 'experience':
        return 'Experience Points'
      case 'currency':
        return 'Personal Currency'
      case 'achievements':
        return 'Achievements'
      case 'streak':
        return 'Current Streak'
      default:
        return 'Overall'
    }
  }

  const formatPoints = (points: number, category: string) => {
    switch (category) {
      case 'currency':
        return formatCurrency(points)
      case 'experience':
        return formatExperience(points)
      case 'streak':
        return `${points} days`
      case 'achievements':
        return `${points} earned`
      default:
        return points.toLocaleString()
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'This Week'
      case 'month':
        return 'This Month'
      case 'all':
        return 'All Time'
      default:
        return 'This Week'
    }
  }

  if (leaderboardLoading || userStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* User Stats Card */}
      {userStats && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Ranking</h3>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(selectedCategory)} • {getPeriodLabel(selectedPeriod)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {userRank ? (
                  <div className="flex items-center space-x-2">
                    {getRankIcon(userRank)}
                    <span className="text-2xl font-bold">#{userRank}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Not ranked</div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{userStats.level}</div>
                <div className="text-xs text-muted-foreground">{getLevelTitle(userStats.level)}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatExperience(userStats.experience_points)}</div>
                <div className="text-xs text-muted-foreground">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{formatCurrency(userStats.personal_currency)}</div>
                <div className="text-xs text-muted-foreground">Currency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{userStats.streak_days}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={(value: 'week' | 'month' | 'all') => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={(value: 'overall' | 'experience' | 'currency' | 'achievements' | 'streak') => setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Score</SelectItem>
                  <SelectItem value="experience">Experience Points</SelectItem>
                  <SelectItem value="currency">Personal Currency</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="streak">Current Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getCategoryIcon(selectedCategory)}
            <span>{getCategoryLabel(selectedCategory)} Leaderboard</span>
          </CardTitle>
          <CardDescription>
            Top performers for {getPeriodLabel(selectedPeriod)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardData && leaderboardData.length > 0 ? (
            <div className="space-y-4">
              {leaderboardData.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                      <Badge className={getRankBadgeColor(entry.rank)}>
                        #{entry.rank}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {entry.profile.avatar_url ? (
                        <img
                          src={entry.profile.avatar_url}
                          alt={entry.profile.full_name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {entry.profile.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <div className="font-semibold">{entry.profile.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          @{entry.profile.username} • Level {entry.profile.level}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatPoints(entry.points, selectedCategory)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCategory === 'overall' && (
                        <>
                          {formatExperience(entry.profile.experience_points)} XP • {formatCurrency(entry.profile.personal_currency)} coins
                        </>
                      )}
                      {selectedCategory === 'experience' && `${entry.profile.level} level`}
                      {selectedCategory === 'currency' && `${entry.profile.level} level`}
                      {selectedCategory === 'achievements' && `${entry.profile.streak_days} day streak`}
                      {selectedCategory === 'streak' && `${entry.profile.level} level`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leaderboard data</h3>
              <p className="text-muted-foreground">
                Start participating to see your ranking!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Rank Higher */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>How to Rank Higher</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">For Overall Score:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create posts and engage with the community</li>
                <li>• Complete skill exchange meetups</li>
                <li>• Maintain daily activity streaks</li>
                <li>• Earn achievements and level up</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">For Experience Points:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Post regularly and get engagement</li>
                <li>• Complete meetups and events</li>
                <li>• Earn achievements for bonus XP</li>
                <li>• Help others learn and teach skills</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
