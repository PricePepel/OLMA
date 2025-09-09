import { Metadata } from 'next'
import { NotificationsComponent } from '@/components/notifications/notifications-component'

export const metadata: Metadata = {
  title: 'Notifications - OLMA',
  description: 'Stay updated with your notifications',
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with your notifications
        </p>
      </div>
      
      <NotificationsComponent />
    </div>
  )
}









