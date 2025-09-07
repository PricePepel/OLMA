'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Flag, 
  Eye, 
  EyeOff, 
  Ban, 
  CheckCircle, 
  XCircle,
  User,
  MessageSquare,
  Users,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { type Report } from '@/types/api'

interface ReportWithDetails extends Report {
  reporter: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  target_content?: string
  target_author?: {
    id: string
    username: string
    full_name: string
  }
}

export function AdminModerationComponent() {
  const [activeTab, setActiveTab] = useState('reports')
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch reports
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports
  } = useApi<{ reports: ReportWithDetails[], nextCursor?: string }>({
    url: '/api/reports?status=pending&limit=50'
  })

  const reports = reportsData?.reports || []

  // Fetch user restrictions
  const {
    data: restrictionsData,
    isLoading: restrictionsLoading,
    error: restrictionsError,
    refetch: refetchRestrictions
  } = useApi<{ restrictions: any[] }>({
    url: '/api/admin/restrictions'
  })

  const restrictions = restrictionsData?.restrictions || []

  // Handle report action
  const handleReportAction = async (reportId: string, action: string, reason?: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process report')
      }

      toast.success(`Report ${action} successfully`)
      setSelectedReport(null)
      refetchReports()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process report')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle user restriction
  const handleUserRestriction = async (userId: string, action: string, duration?: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/restrictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, duration })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to restrict user')
      }

      toast.success(`User ${action} successfully`)
      refetchRestrictions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restrict user')
    } finally {
      setIsProcessing(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Get reason badge
  const getReasonBadge = (reason: string) => {
    const colorMap: Record<string, string> = {
      'inappropriate_content': 'destructive',
      'spam': 'secondary',
      'harassment': 'destructive',
      'fake_news': 'warning',
      'copyright': 'warning',
      'other': 'outline'
    }
    
    return (
      <Badge variant={colorMap[reason] as any || 'outline'}>
        {reason.replace('_', ' ')}
      </Badge>
    )
  }

  // Get target type icon
  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'post':
        return <MessageSquare className="h-4 w-4" />
      case 'user':
        return <User className="h-4 w-4" />
      case 'club':
        return <Users className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  if (reportsError || restrictionsError) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load moderation data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="restrictions" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Restrictions ({restrictions.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending reports
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center space-x-2">
                            {getTargetIcon(report.target_type)}
                            {getStatusBadge(report.status)}
                            {getReasonBadge(report.reason)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                Reported by @{report.reporter.username}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatRelativeTime(report.created_at)}
                              </span>
                            </div>
                            
                            {report.description && (
                              <p className="text-sm">{report.description}</p>
                            )}
                            
                            {report.target_content && (
                              <div className="bg-muted p-3 rounded-md">
                                <p className="text-sm font-medium mb-1">Reported Content:</p>
                                <p className="text-sm">{report.target_content}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Report</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Reporter</p>
                                  <p className="text-sm text-muted-foreground">
                                    {report.reporter.full_name} (@{report.reporter.username})
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Target Type</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {report.target_type}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Reason</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {report.reason.replace('_', ' ')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Reported</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatRelativeTime(report.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              {report.description && (
                                <div>
                                  <p className="text-sm font-medium">Description</p>
                                  <p className="text-sm text-muted-foreground">
                                    {report.description}
                                  </p>
                                </div>
                              )}
                              
                              {report.target_content && (
                                <div>
                                  <p className="text-sm font-medium">Reported Content</p>
                                  <div className="bg-muted p-3 rounded-md mt-1">
                                    <p className="text-sm">{report.target_content}</p>
                                  </div>
                                </div>
                              )}
                              
                              <Separator />
                              
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => handleReportAction(report.id, 'dismiss')}
                                  disabled={isProcessing}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Dismiss
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReportAction(report.id, 'resolve', 'Content removed')}
                                  disabled={isProcessing}
                                >
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Remove Content
                                </Button>
                                <Button
                                  onClick={() => handleReportAction(report.id, 'resolve', 'Content reviewed')}
                                  disabled={isProcessing}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolve
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Restrictions</CardTitle>
            </CardHeader>
            <CardContent>
              {restrictionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : restrictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active restrictions
                </div>
              ) : (
                <div className="space-y-4">
                  {restrictions.map((restriction) => (
                    <Card key={restriction.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{restriction.user.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              @{restriction.user.username}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={restriction.type === 'ban' ? 'destructive' : 'secondary'}>
                            {restriction.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(restriction.created_at)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pending review
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Restrictions</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{restrictions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Users restricted
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => {
                    const today = new Date()
                    const reportDate = new Date(r.created_at)
                    return reportDate.toDateString() === today.toDateString()
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
