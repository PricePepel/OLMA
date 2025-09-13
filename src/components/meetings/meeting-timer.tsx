'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, Pause, Square } from 'lucide-react'
import { format } from 'date-fns'

interface MeetingTimerProps {
  meetingId: string
  startTime: string
  duration: number // in minutes
  onEndMeeting: () => void
  isActive: boolean
}

export function MeetingTimer({ 
  meetingId, 
  startTime, 
  duration, 
  onEndMeeting, 
  isActive 
}: MeetingTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const startTimestamp = new Date(startTime).getTime()
    const now = Date.now()
    const initialElapsed = Math.floor((now - startTimestamp) / 1000)
    setElapsedTime(initialElapsed)
    setIsRunning(true)

    const interval = setInterval(() => {
      const currentTime = Date.now()
      const elapsed = Math.floor((currentTime - startTimestamp) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isActive])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const totalSeconds = duration * 60
    return Math.min((elapsedTime / totalSeconds) * 100, 100)
  }

  const getTimeRemaining = () => {
    const totalSeconds = duration * 60
    const remaining = Math.max(totalSeconds - elapsedTime, 0)
    return formatTime(remaining)
  }

  const isOverTime = elapsedTime > (duration * 60)

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Meeting in Progress
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Elapsed Time
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className={isOverTime ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
              {isOverTime ? 'Over Time' : `${getTimeRemaining()} remaining`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                isOverTime 
                  ? 'bg-red-500' 
                  : getProgressPercentage() > 80 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
            />
          </div>
        </div>

        {/* Meeting Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground">Planned Duration</div>
            <div>{duration} minutes</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Started At</div>
            <div>{format(new Date(startTime), 'h:mm a')}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={onEndMeeting}
            className="w-full"
            variant="destructive"
          >
            <Square className="h-4 w-4 mr-2" />
            End Meeting
          </Button>
        </div>

        {/* Over Time Warning */}
        {isOverTime && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm text-red-800 dark:text-red-200">
              ⚠️ Meeting has exceeded the planned duration. Consider ending the session.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}






