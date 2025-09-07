'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Ban,
  FileText,
  MessageSquare,
  User,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

interface ReportListProps {
  reports: Report[]
  onSelectReport: (report: Report) => void
  onAction: (reportId: string, action: string, details?: string) => Promise<void>
  isLoading: boolean
}

export function ReportList({ reports, onSelectReport, onAction, isLoading }: ReportListProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  const handleAction = async (reportId: string, action: string) => {
    await onAction(reportId, action)
    setIsDialogOpen(false)
  }

  const openReportDetails = (report: Report) => {
    setSelectedReport(report)
    onSelectReport(report)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading reports...</div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reports found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getTargetIcon(report.target_type)}
                  <span className="capitalize">{report.target_type}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {report.reason}
              </TableCell>
              <TableCell>
                {getStatusBadge(report.status)}
              </TableCell>
              <TableCell>
                {report.reporter_name || 'Anonymous'}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openReportDetails(report)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {report.status === 'open' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(report.id, 'resolve')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(report.id, 'reject')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Report Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTargetIcon(selectedReport.target_type)}
                    <span className="capitalize">{selectedReport.target_type}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Reason:</span>
                  <p className="mt-1">{selectedReport.reason}</p>
                </div>
                <div>
                  <span className="font-medium">Reporter:</span>
                  <p className="mt-1">{selectedReport.reporter_name || 'Anonymous'}</p>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <p className="mt-1">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedReport.target_content && (
                <div>
                  <span className="font-medium">Reported Content:</span>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedReport.target_content}</p>
                  </div>
                </div>
              )}

              {selectedReport.status === 'open' && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAction(selectedReport.id, 'resolve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(selectedReport.id, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAction(selectedReport.id, 'hide_content')}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Content
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAction(selectedReport.id, 'ban_user')}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
