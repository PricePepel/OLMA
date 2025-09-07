import { ActivityComponent } from '@/components/activity/activity-component'

export default function ActivityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground">Track your recent activity and engagement</p>
      </div>
      <ActivityComponent />
    </div>
  )
}







