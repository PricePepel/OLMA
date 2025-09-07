import { Metadata } from 'next'
import { AchievementsComponent } from '@/components/achievements/achievements-component'

export const metadata: Metadata = {
  title: 'Achievements - OLMA',
  description: 'Track your progress and earn achievements',
}

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and earn achievements
        </p>
      </div>
      
      <AchievementsComponent />
    </div>
  )
}


