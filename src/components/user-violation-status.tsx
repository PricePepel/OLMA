'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Shield, 
  Ban, 
  CheckCircle,
  Clock,
  Info
} from 'lucide-react'

interface ViolationStatus {
  is_banned: boolean
  ban_reason: string | null
  banned_at: string | null
  expires_at: string | null
  violation_counts: {
    easy: number
    medium: number
    hard: number
    total: number
  }
  thresholds: {
    easy: number
    medium: number
    hard: number
  }
}

interface UserViolationStatusProps {
  userId: string
  showDetails?: boolean
}

export function UserViolationStatus({ userId, showDetails = false }: UserViolationStatusProps) {
  const [status, setStatus] = useState<ViolationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/user/ban-status?user_id=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch violation status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [userId])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  const getViolationColor = (type: string, count: number, threshold: number) => {
    const percentage = (count / threshold) * 100
    if (percentage >= 100) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    if (percentage >= 75) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  const getStatusIcon = () => {
    if (status.is_banned) {
      return <Ban className="h-5 w-5 text-red-500" />
    }
    if (status.violation_counts.total > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getStatusText = () => {
    if (status.is_banned) {
      return 'Banned'
    }
    if (status.violation_counts.total > 0) {
      return 'Has Violations'
    }
    return 'Clean Record'
  }

  const getStatusColor = () => {
    if (status.is_banned) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    if (status.violation_counts.total > 0) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Account Status
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ban Status */}
        {status.is_banned && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <Ban className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="font-medium">Account is banned</div>
              {status.ban_reason && (
                <div className="text-sm mt-1">Reason: {status.ban_reason}</div>
              )}
              {status.banned_at && (
                <div className="text-sm mt-1">
                  Banned on: {new Date(status.banned_at).toLocaleDateString()}
                </div>
              )}
              {status.expires_at && (
                <div className="text-sm mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires: {new Date(status.expires_at).toLocaleDateString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Violation Counts */}
        {showDetails && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Violation History</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Badge className={getViolationColor('easy', status.violation_counts.easy, status.thresholds.easy)}>
                  Easy: {status.violation_counts.easy}/{status.thresholds.easy}
                </Badge>
              </div>
              <div className="text-center">
                <Badge className={getViolationColor('medium', status.violation_counts.medium, status.thresholds.medium)}>
                  Medium: {status.violation_counts.medium}/{status.thresholds.medium}
                </Badge>
              </div>
              <div className="text-center">
                <Badge className={getViolationColor('hard', status.violation_counts.hard, status.thresholds.hard)}>
                  Hard: {status.violation_counts.hard}/{status.thresholds.hard}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <Badge variant="outline">
                Total: {status.violation_counts.total} violations
              </Badge>
            </div>
          </div>
        )}

        {/* Warning for approaching limits */}
        {!status.is_banned && status.violation_counts.total > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <div className="font-medium">Warning</div>
              <div className="text-sm mt-1">
                {status.violation_counts.hard >= 2 && (
                  <div>⚠️ {3 - status.violation_counts.hard} more hard violations will result in a ban</div>
                )}
                {status.violation_counts.medium >= 8 && (
                  <div>⚠️ {10 - status.violation_counts.medium} more medium violations will result in a ban</div>
                )}
                {status.violation_counts.easy >= 12 && (
                  <div>⚠️ {15 - status.violation_counts.easy} more easy violations will result in a ban</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}




