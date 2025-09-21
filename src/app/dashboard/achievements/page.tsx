import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Achievements - OLMA Dashboard',
  description: 'View your achievements',
}

export default function DashboardAchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          View your achievements and progress
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Achievements component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}










