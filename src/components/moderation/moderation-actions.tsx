'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  EyeOff, 
  Trash2, 
  Ban, 
  UserX, 
  Shield, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

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

interface ModerationActionsProps {
  selectedReport: Report | null
  onAction: (reportId: string, action: string, details?: string) => Promise<void>
  isLoading: boolean
}

export function ModerationActions({ selectedReport, onAction, isLoading }: ModerationActionsProps) {
  const [actionType, setActionType] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [targetId, setTargetId] = useState<string>('')

  const handleQuickAction = async (action: string) => {
    if (!selectedReport) {
      toast.error('Please select a report first')
      return
    }

    try {
      await onAction(selectedReport.id, action, reason || undefined)
      resetForm()
    } catch (error) {
      toast.error(`Failed to ${action}`)
    }
  }

  const handleCustomAction = async () => {
    if (!actionType || !targetId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const details = {
        reason: reason || 'Manual moderation action',
        duration: duration || undefined
      }

      await onAction(targetId, actionType, JSON.stringify(details))
      resetForm()
      toast.success('Action applied successfully')
    } catch (error) {
      toast.error('Failed to apply action')
    }
  }

  const resetForm = () => {
    setActionType('')
    setDuration('')
    setReason('')
    setTargetId('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common moderation actions for selected report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedReport ? (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected Report:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.target_type} - {selectedReport.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('resolve')}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('reject')}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('hide_content')}
                  disabled={isLoading}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Content
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleQuickAction('ban_user')}
                  disabled={isLoading}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-reason">Action Reason (Optional)</Label>
                <Textarea
                  id="action-reason"
                  placeholder="Reason for this action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a report from the Reports tab to perform quick actions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserX className="h-5 w-5" />
            <span>Custom Actions</span>
          </CardTitle>
          <CardDescription>
            Apply moderation actions to any content or user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-id">Target ID</Label>
            <Input
              id="target-id"
              placeholder="Enter content or user ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-type">Action Type</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="hide">Hide Content</SelectItem>
                <SelectItem value="delete">Delete Content</SelectItem>
                <SelectItem value="soft_ban">Soft Ban (Temporary)</SelectItem>
                <SelectItem value="ban">Permanent Ban</SelectItem>
                <SelectItem value="restrict">Restrict User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Optional)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-reason">Reason</Label>
            <Textarea
              id="custom-reason"
              placeholder="Reason for this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleCustomAction}
            disabled={isLoading || !actionType || !targetId}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Apply Action
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
