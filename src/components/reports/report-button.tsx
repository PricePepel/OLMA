'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Flag, AlertTriangle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'

interface ReportButtonProps {
  targetType: 'post' | 'message' | 'profile'
  targetId: string
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const reportReasons = {
  post: [
    'Spam or misleading content',
    'Harassment or bullying',
    'Inappropriate content',
    'False information',
    'Copyright violation',
    'Other'
  ],
  message: [
    'Harassment or bullying',
    'Spam or unwanted content',
    'Inappropriate content',
    'Threats or violence',
    'Other'
  ],
  profile: [
    'Fake account',
    'Harassment or bullying',
    'Inappropriate content',
    'Impersonation',
    'Other'
  ]
}

export function ReportButton({ 
  targetType, 
  targetId, 
  className,
  variant = 'ghost',
  size = 'sm'
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleReport = async (reason: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit report')
      }
      
      toast.success('Report submitted successfully')
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isLoading}
        >
          <Flag className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Report</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Report {targetType}
        </div>
        {reportReasons[targetType].map((reason) => (
          <DropdownMenuItem
            key={reason}
            onClick={() => handleReport(reason)}
            className="cursor-pointer"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {reason}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
