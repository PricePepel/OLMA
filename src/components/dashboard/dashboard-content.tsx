'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  MessageCircle, 
  Trophy, 
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  Globe,
  User
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { usePerformanceMonitor } from '@/hooks/use-performance'
import { useApi } from '@/hooks/use-api'

export function DashboardContent() {
  const { profile, loading } = useAuth()
  
  // Monitor performance
  usePerformanceMonitor('DashboardContent')

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useApi<any>({
    url: '/api/dashboard/stats',
    method: 'GET'
  })

  // Fetch recent activity
  const { data: activities, isLoading: activitiesLoading } = useApi<any[]>({
    url: '/api/dashboard/activity',
    method: 'GET'
  })

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Dashboard</h1>
        <p className="text-lg mb-6">Please log in to access your dashboard.</p>
        <Link href="/login">
          <Button className="text-lg">
            <ArrowRight className="mr-2" />
            Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {profile.full_name}!</CardTitle>
          <CardDescription>Your personal dashboard overview.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is your dashboard. You can view your performance, manage your account,
            and access various tools and features.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Users</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalUsers?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Registered users on platform
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Earned</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold">
                  {statsLoading ? '...' : `$${stats?.totalEarned || 0}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  From completed meetings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Completed Offers</CardTitle>
                <BookOpen className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.completedOffers || 0}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Successful meetings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Location</CardTitle>
                <MapPin className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.location || 'Not set'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your current location
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access common tasks with a single click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/skills">
              <Button className="flex items-center w-full">
                <BookOpen className="h-5 w-5 mr-2" />
                Manage Skills
              </Button>
            </Link>
            <Link href="/dashboard/find-teachers">
              <Button className="flex items-center w-full">
                <Users className="h-5 w-5 mr-2" />
                Find Teachers
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button className="flex items-center w-full">
                <User className="h-5 w-5 mr-2" />
                View Profile
              </Button>
            </Link>
            <Link href="/dashboard/skills">
              <Button className="flex items-center w-full">
                <Globe className="h-5 w-5 mr-2" />
                Browse All Skills
              </Button>
            </Link>
            <Link href="/dashboard/achievements">
              <Button className="flex items-center w-full">
                <Trophy className="h-5 w-5 mr-2" />
                View Achievements
              </Button>
            </Link>
            <Link href="/dashboard/offers">
              <Button className="flex items-center w-full">
                <Plus className="h-5 w-5 mr-2" />
                Create Offer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions and updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => {
                const getIcon = (iconType: string) => {
                  switch (iconType) {
                    case 'message':
                      return <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                    case 'calendar':
                      return <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                    case 'book':
                      return <BookOpen className="h-5 w-5 text-green-500 mr-2" />
                    default:
                      return <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                  }
                }

                const formatTimeAgo = (timestamp: string) => {
                  const now = new Date()
                  const time = new Date(timestamp)
                  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
                  
                  if (diffInMinutes < 1) return 'Just now'
                  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
                  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
                  return `${Math.floor(diffInMinutes / 1440)}d ago`
                }

                return (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getIcon(activity.icon)}
                      <div>
                        <span className="font-medium">{activity.title}</span>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
              <p className="text-muted-foreground">
                Start using the platform to see your activity here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
