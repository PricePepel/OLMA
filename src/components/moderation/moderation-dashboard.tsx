'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Ban
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { ReportList } from './report-list'
import { ModerationActions } from './moderation-actions'
import { ModerationStats } from './moderation-stats'

interface Report {
  id: string
  target_type: 'post' | 'message' | 'profile'
  target_id: string
  reason: string
  status: 'open' | 'review' | 'resolved' | 'rejected'
  reporter_id: string
  created_at: string
  target_content?: string
  reporter_name?: string
}

interface ModerationStats {
  total_reports: number
  open_reports: number
  resolved_reports: number
  banned_users: number
  hidden_content: number
}

export function ModerationDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [activeTab, setActiveTab] = useState('reports')
  
  const { data: reportsData, isLoading: loadingReports, refetch: refetchReports } = useApi<Report[]>({
    url: '/api/reports',
    method: 'GET'
  })
  
  const { data: statsData, isLoading: loadingStats, refetch: refetchStats } = useApi<ModerationStats>({
    url: '/api/moderation/stats',
    method: 'GET'
  })
  


  useEffect(() => {
    if (reportsData) {
      setReports(reportsData)
    }
  }, [reportsData])

  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
  }, [statsData])

  const handleReportAction = async (reportId: string, action: string, details?: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update report')
      }
      
      toast.success(`Report ${action} successfully`)
      refetchReports()
      refetchStats()
    } catch (error) {
      toast.error(`Failed to ${action} report`)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'default',
      review: 'secondary',
      resolved: 'default',
      rejected: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'post':
        return <FileText className="h-4 w-4" />
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'profile':
        return <User className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.total_reports || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loadingStats ? '...' : stats?.open_reports || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loadingStats ? '...' : stats?.banned_users || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hidden Content</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loadingStats ? '...' : stats?.hidden_content || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Review and take action on user reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportList 
                reports={reports}
                onSelectReport={setSelectedReport}
                onAction={handleReportAction}
                isLoading={loadingReports}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
              <CardDescription>
                Quick actions for content and user moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModerationActions 
                selectedReport={selectedReport}
                onAction={handleReportAction}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Statistics</CardTitle>
              <CardDescription>
                Detailed analytics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModerationStats stats={stats} isLoading={loadingStats} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
