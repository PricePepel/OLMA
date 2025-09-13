import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications - OLMA Dashboard',
  description: 'View and manage your notifications',
}

export default function DashboardNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage your notifications
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Notifications component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}








