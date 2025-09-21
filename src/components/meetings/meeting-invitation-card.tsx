'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Check, 
  X, 
  Play, 
  Pause,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { MeetingTimer } from './meeting-timer'
import { PostMeetingFeedback } from './post-meeting-feedback'

interface MeetingInvitation {
  id: string
  conversation_id: string
  inviter_id: string
  invitee_id: string
  inviter_skill_id: string
  invitee_skill_id: string
  meeting_location: string
  meeting_date: string
  meeting_duration: number
  actual_duration?: number
  coins_earned?: number
  status: 'pending' | 'accepted' | 'denied' | 'started' | 'completed' | 'cancelled'
  inviter_message?: string
  invitee_response?: string
  created_at: string
  updated_at: string
  inviter_skill: {
    id: string
    name: string
    category: string
  }
  invitee_skill: {
    id: string
    name: string
    category: string
  }
  inviter: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  invitee: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
}

interface MeetingInvitationCardProps {
  meeting: MeetingInvitation
  onStatusChange: () => void
}

export function MeetingInvitationCard({ meeting, onStatusChange }: MeetingInvitationCardProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const isInviter = user?.id === meeting.inviter_id
  const isInvitee = user?.id === meeting.invitee_id
  const otherUser = isInviter ? meeting.invitee : meeting.inviter

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'denied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'started': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'accepted': return 'Accepted'
      case 'denied': return 'Denied'
      case 'started': return 'Started'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const handleStatusChange = async (newStatus: string, inviteeResponse?: string, actualDuration?: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          invitee_response: inviteeResponse,
          actual_duration: actualDuration
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to update meeting status')
      }

      toast.success(`Meeting ${newStatus} successfully!`)
      onStatusChange()

      // Show feedback popup when meeting is completed
      if (newStatus === 'completed') {
        setShowFeedback(true)
      }

    } catch (error) {
      console.error('Meeting status update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update meeting status')
    } finally {
      setIsLoading(false)
    }
  }

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'h:mm a')
    }
  }

  const { date, time } = formatMeetingDate(meeting.meeting_date)

  // Show timer for started meetings
  if (meeting.status === 'started') {
    return (
      <MeetingTimer
        meetingId={meeting.id}
        startTime={meeting.updated_at} // Use updated_at as start time when status changed to 'started'
        duration={meeting.meeting_duration}
        onEndMeeting={(actualDuration) => handleStatusChange('completed', undefined, actualDuration)}
        isActive={true}
      />
    )
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto border-2 border-dashed border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meeting Invitation
            </CardTitle>
            <Badge className={getStatusColor(meeting.status)}>
              {getStatusText(meeting.status)}
            </Badge>
          </div>
        </CardHeader>

      <CardContent className="space-y-4">
        {/* Meeting Details */}
        <div className="space-y-3">
          {/* Skill Exchange Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">50/50 Skill Exchange</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{isInviter ? 'You teach:' : `${meeting.inviter.full_name} teaches:`}</span>
                <span className="text-blue-700 dark:text-blue-300">{meeting.inviter_skill?.name || 'Unknown Skill'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{isInviter ? `${meeting.invitee.full_name} teaches:` : 'You learn:'}</span>
                <span className="text-blue-700 dark:text-blue-300">{meeting.invitee_skill?.name || 'Unknown Skill'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {meeting.status === 'accepted' && (
                <span className="text-green-600 dark:text-green-400 font-medium mr-1">Accepted</span>
              )}
              {date} at {time}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.meeting_location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.meeting_duration} minutes</span>
            {meeting.coins_earned && meeting.coins_earned > 0 && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                🪙 {meeting.coins_earned} coins earned
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        {meeting.inviter_message && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{meeting.inviter.full_name}:</span> {meeting.inviter_message}
            </p>
          </div>
        )}

        {meeting.invitee_response && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{meeting.invitee.full_name}:</span> {meeting.invitee_response}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {meeting.status === 'pending' && isInvitee && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusChange('accepted')}
              disabled={isLoading}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('denied')}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Deny
            </Button>
          </div>
        )}

        {meeting.status === 'accepted' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusChange('started')}
              disabled={isLoading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Meeting
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('cancelled')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}

        {(meeting.status as string) === 'started' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusChange('completed')}
              disabled={isLoading}
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              End Meeting
            </Button>
          </div>
        )}

        {(meeting.status === 'denied' || meeting.status === 'cancelled') && (
          <div className="text-center text-sm text-muted-foreground">
            This meeting invitation has been {meeting.status}
          </div>
        )}

        {meeting.status === 'completed' && (
          <div className="text-center text-sm text-green-600 dark:text-green-400">
            Meeting completed successfully! 🎉
          </div>
        )}
      </CardContent>
    </Card>

    {/* Post-meeting feedback popup */}
    <PostMeetingFeedback
      isOpen={showFeedback}
      onClose={() => setShowFeedback(false)}
      meetingId={meeting.id}
      otherUser={otherUser}
      onFeedbackSubmitted={() => {
        setShowFeedback(false)
        onStatusChange()
      }}
    />
    </>
  )
}

