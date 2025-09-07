'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Flag, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  type: string
  reason: string
  status: string
  moderator_notes?: string
  created_at: string
  reported_user?: {
    id: string
    full_name: string
    username: string
    avatar_url?: string
  }
  reported_post?: {
    id: string
    content: string
  }
  reported_club?: {
    id: string
    name: string
  }
}

const REPORT_TYPES = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'other', label: 'Other' }
]

export function ReportsComponent() {
  const { user } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [createReportData, setCreateReportData] = useState({
    type: '',
    reason: '',
    reported_user_id: '',
    reported_post_id: '',
    reported_club_id: ''
  })

  // Fetch user's reports
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useApi<Report[]>({
    url: '/api/reports',
    enabled: !!user
  })

  const handleCreateReport = async () => {
    if (!user) {
      toast.error('You must be logged in to create a report')
      return
    }

    if (!createReportData.type || !createReportData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createReportData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create report')
      }

      toast.success('Report submitted successfully!')
      setIsCreateDialogOpen(false)
      setCreateReportData({
        type: '',
        reason: '',
        reported_user_id: '',
        reported_post_id: '',
        reported_club_id: ''
      })
      refetchReports()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create report')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'harassment':
        return <User className="h-4 w-4 text-orange-600" />
      case 'spam':
        return <MessageSquare className="h-4 w-4 text-yellow-600" />
      case 'fake_profile':
        return <User className="h-4 w-4 text-purple-600" />
      default:
        return <Flag className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const ReportCard = ({ report }: { report: Report }) => {
    return (
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getReportTypeIcon(report.type)}
              <div>
                <CardTitle className="text-lg">
                  {REPORT_TYPES.find(t => t.value === report.type)?.label || report.type}
                </CardTitle>
                <CardDescription>
                  Reported on {formatDate(report.created_at)}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(report.status)}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Reason:</h4>
            <p className="text-sm text-muted-foreground">{report.reason}</p>
          </div>
          
          {report.reported_user && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={report.reported_user.avatar_url} />
                <AvatarFallback>
                  {report.reported_user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{report.reported_user.full_name}</p>
                <p className="text-xs text-muted-foreground">@{report.reported_user.username}</p>
              </div>
            </div>
          )}
          
          {report.reported_post && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-1">Reported Post:</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {report.reported_post.content}
              </p>
            </div>
          )}
          
          {report.reported_club && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{report.reported_club.name}</p>
                <p className="text-xs text-muted-foreground">Club</p>
              </div>
            </div>
          )}
          
          {report.moderator_notes && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-sm mb-1 text-blue-800 dark:text-blue-200">
                Moderator Notes:
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {report.moderator_notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const ReportSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
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
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Reports</h2>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Flag className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Report inappropriate content, harassment, or other violations.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Type *</label>
                <Select 
                  value={createReportData.type} 
                  onValueChange={(value) => setCreateReportData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason *</label>
                <Textarea
                  value={createReportData.reason}
                  onChange={(e) => setCreateReportData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide details about the issue..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Reported User ID (Optional)</label>
                  <Input
                    value={createReportData.reported_user_id}
                    onChange={(e) => setCreateReportData(prev => ({ ...prev, reported_user_id: e.target.value }))}
                    placeholder="User ID to report"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Reported Post ID (Optional)</label>
                  <Input
                    value={createReportData.reported_post_id}
                    onChange={(e) => setCreateReportData(prev => ({ ...prev, reported_post_id: e.target.value }))}
                    placeholder="Post ID to report"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Reported Club ID (Optional)</label>
                  <Input
                    value={createReportData.reported_club_id}
                    onChange={(e) => setCreateReportData(prev => ({ ...prev, reported_club_id: e.target.value }))}
                    placeholder="Club ID to report"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      {reportsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReportSkeleton key={i} />
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't submitted any reports yet.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}

