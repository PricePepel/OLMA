'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Flag, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface PostMeetingFeedbackProps {
  isOpen: boolean
  onClose: () => void
  meetingId: string
  otherUser: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  onFeedbackSubmitted: () => void
}

interface ReportOption {
  id: string
  label: string
  category: 'easy' | 'medium' | 'hard'
  description: string
}

const REPORT_OPTIONS: ReportOption[] = [
  // Easy violations
  {
    id: 'no_materials',
    label: "Didn't bring materials",
    category: 'easy',
    description: 'User did not bring required learning materials'
  },
  {
    id: 'late_arrival',
    label: 'Arrived late',
    category: 'easy',
    description: 'User was late to the meeting without notice'
  },
  {
    id: 'distracted',
    label: 'Was distracted',
    category: 'easy',
    description: 'User was not focused during the meeting'
  },
  {
    id: 'poor_communication',
    label: 'Poor communication',
    category: 'easy',
    description: 'User had difficulty communicating clearly'
  },
  
  // Medium violations
  {
    id: 'inappropriate_language',
    label: 'Used inappropriate language',
    category: 'medium',
    description: 'User used unprofessional or inappropriate language'
  },
  {
    id: 'disrespectful_behavior',
    label: 'Disrespectful behavior',
    category: 'medium',
    description: 'User showed disrespectful behavior during the meeting'
  },
  {
    id: 'inappropriate_content',
    label: 'Shared inappropriate content',
    category: 'medium',
    description: 'User shared content that was not appropriate for the learning environment'
  },
  {
    id: 'harassment',
    label: 'Harassment',
    category: 'medium',
    description: 'User engaged in harassing behavior'
  },
  
  // Hard violations
  {
    id: 'threats',
    label: 'Made threats',
    category: 'hard',
    description: 'User made threatening statements or behavior'
  },
  {
    id: 'harmful_behavior',
    label: 'Tried to harm',
    category: 'hard',
    description: 'User attempted to cause physical or emotional harm'
  },
  {
    id: 'illegal_activity',
    label: 'Illegal activity',
    category: 'hard',
    description: 'User engaged in or promoted illegal activities'
  },
  {
    id: 'severe_harassment',
    label: 'Severe harassment',
    category: 'hard',
    description: 'User engaged in severe or persistent harassment'
  }
]

export function PostMeetingFeedback({
  isOpen,
  onClose,
  meetingId,
  otherUser,
  onFeedbackSubmitted
}: PostMeetingFeedbackProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/meetings/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          rated_user_id: otherUser.id,
          rating,
          comment: comment.trim() || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to submit rating')
      }

      toast.success('Rating submitted successfully!')
      onFeedbackSubmitted()
      onClose()
    } catch (error) {
      console.error('Rating submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportSubmit = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report reason')
      return
    }

    setIsSubmitting(true)
    try {
      // Submit each selected report
      const reportPromises = selectedReports.map(reportId => {
        const reportOption = REPORT_OPTIONS.find(opt => opt.id === reportId)
        if (!reportOption) return Promise.resolve()

        return fetch('/api/meetings/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meeting_id: meetingId,
            reported_user_id: otherUser.id,
            report_category: reportOption.category,
            report_reason: reportOption.label,
            description: reportDescription.trim() || reportOption.description
          }),
        })
      })

      await Promise.all(reportPromises)
      toast.success('Report submitted successfully!')
      onFeedbackSubmitted()
      onClose()
    } catch (error) {
      console.error('Report submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'easy': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const groupedReports = REPORT_OPTIONS.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, ReportOption[]>)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Meeting Feedback
          </DialogTitle>
        </DialogHeader>

        {!showReportForm ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {otherUser.avatar_url ? (
                  <img 
                    src={otherUser.avatar_url} 
                    alt={otherUser.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{otherUser.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
              </div>
            </div>

            {/* Rating Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Rate your experience (1-5 stars)</Label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about the meeting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReportForm(true)}
                className="flex-1"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </Button>
              <Button
                onClick={handleRatingSubmit}
                disabled={isSubmitting || rating === 0}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-medium">Report User</h3>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                {otherUser.avatar_url ? (
                  <img 
                    src={otherUser.avatar_url} 
                    alt={otherUser.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">{otherUser.full_name}</h4>
                <p className="text-sm text-red-600 dark:text-red-400">@{otherUser.username}</p>
              </div>
            </div>

            {/* Report Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Select violation(s):</Label>
              
              {Object.entries(groupedReports).map(([category, options]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium capitalize text-sm text-muted-foreground">
                    {category} Violations
                  </h4>
                  <div className="grid gap-2">
                    {options.map((option) => (
                      <Card 
                        key={option.id}
                        className={`cursor-pointer transition-colors ${
                          selectedReports.includes(option.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => toggleReport(option.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedReports.includes(option.id)}
                                  onChange={() => toggleReport(option.id)}
                                  className="rounded"
                                />
                                <span className="font-medium">{option.label}</span>
                                <Badge className={getCategoryColor(option.category)}>
                                  {option.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Description */}
            <div className="space-y-2">
              <Label htmlFor="report-description">Additional Details (Optional)</Label>
              <Textarea
                id="report-description"
                placeholder="Provide additional context about the violation..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReportForm(false)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Back to Rating
              </Button>
              <Button
                onClick={handleReportSubmit}
                disabled={isSubmitting || selectedReports.length === 0}
                variant="destructive"
                className="flex-1"
              >
                <Flag className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}




