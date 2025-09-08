import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events - OLMA Dashboard',
  description: 'View and manage events',
}

export default function DashboardEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          View and manage events
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Events component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}






