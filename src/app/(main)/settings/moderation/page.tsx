import { Suspense } from 'react'
import { ModerationDashboard } from '@/components/moderation/moderation-dashboard'

export default function ModerationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
        <p className="text-muted-foreground">
          Manage reports, content moderation, and user actions
        </p>
      </div>
      
      <Suspense fallback={<div>Loading moderation dashboard...</div>}>
        <ModerationDashboard />
      </Suspense>
    </div>
  )
}
