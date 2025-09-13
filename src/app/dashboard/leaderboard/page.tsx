import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard - OLMA Dashboard',
  description: 'View the leaderboard',
}

export default function DashboardLeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          View the leaderboard and rankings
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Leaderboard component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}









