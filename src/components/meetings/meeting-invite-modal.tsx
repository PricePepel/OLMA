'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarIcon, MapPin, Clock, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { toast } from 'sonner'

interface MeetingInviteModalProps {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  otherUserId: string
  otherUserName: string
  onInviteSent: () => void
}

interface Skill {
  id: string
  name: string
  category: string
}

export function MeetingInviteModal({
  isOpen,
  onClose,
  conversationId,
  otherUserId,
  otherUserName,
  onInviteSent
}: MeetingInviteModalProps) {
  const { user } = useAuth()
  const [selectedSkill, setSelectedSkill] = useState<string>('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date())
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingDuration, setMeetingDuration] = useState('60')
  const [inviterMessage, setInviterMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch user's skills that they can teach
  const { data: userSkills, isLoading: skillsLoading } = useApi<{userSkills: any[]}>({
    url: `/api/user-skills?user_id=${user?.id}`,
    method: 'GET',
    enabled: !!user?.id
  })

  const teachableSkills = userSkills?.userSkills?.filter(skill => skill.can_teach && skill.skills) || []

  const handleSubmit = async () => {
    if (!selectedSkill || !meetingLocation || !meetingDate || !meetingTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // Combine date and time
      const [hours, minutes] = meetingTime.split(':')
      const meetingDateTime = new Date(meetingDate)
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes))

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          invitee_id: otherUserId,
          skill_id: selectedSkill,
          meeting_location: meetingLocation,
          meeting_date: meetingDateTime.toISOString(),
          meeting_duration: parseInt(meetingDuration),
          inviter_message: inviterMessage || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to send meeting invitation')
      }

      toast.success('Meeting invitation sent successfully!')
      onInviteSent()
      onClose()
      
      // Reset form
      setSelectedSkill('')
      setMeetingLocation('')
      setMeetingDate(undefined)
      setMeetingTime('')
      setMeetingDuration('60')
      setInviterMessage('')

    } catch (error) {
      console.error('Meeting invitation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send meeting invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite {otherUserName} to a Meeting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Skill Selection */}
          <div className="space-y-2">
            <Label htmlFor="skill">Skill to Share *</Label>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you want to teach" />
              </SelectTrigger>
              <SelectContent>
                {teachableSkills.map((userSkill) => (
                  <SelectItem key={userSkill.skill.id} value={userSkill.skill.id}>
                    {userSkill.skill.name} (Level {userSkill.proficiency_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {skillsLoading && <p className="text-sm text-muted-foreground">Loading skills...</p>}
          </div>

          {/* Meeting Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Meeting Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Central Park, NYC or Zoom Meeting"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Meeting Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Meeting Date *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={meetingDate ? meetingDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setMeetingDate(e.target.value ? new Date(e.target.value) : undefined)}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10"
              />
            </div>
          </div>

          {/* Meeting Time */}
          <div className="space-y-2">
            <Label htmlFor="time">Meeting Time *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Meeting Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={meetingDuration} onValueChange={setMeetingDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message about the meeting..."
              value={inviterMessage}
              onChange={(e) => setInviterMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
