import { Metadata } from 'next'
import { AdminModerationComponent } from '@/components/admin/admin-moderation-component'

export const metadata: Metadata = {
  title: 'Admin Dashboard - OLMA',
  description: 'Moderation and administration tools',
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Moderation and administration tools
        </p>
      </div>
      
      <AdminModerationComponent />
    </div>
  )
}
