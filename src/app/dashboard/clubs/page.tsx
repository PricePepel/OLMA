import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clubs - OLMA Dashboard',
  description: 'View and manage clubs',
}

export default function DashboardClubsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clubs</h1>
        <p className="text-muted-foreground">
          View and manage clubs
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Clubs component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}






