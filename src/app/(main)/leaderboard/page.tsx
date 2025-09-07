import { Metadata } from 'next'
import { LeaderboardComponent } from '@/components/leaderboard/leaderboard-component'

export const metadata: Metadata = {
  title: 'Leaderboard - OLMA',
  description: 'Community rankings and achievements',
}

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See top performers and achievements in your community
        </p>
      </div>
      <LeaderboardComponent />
    </div>
  )
}
