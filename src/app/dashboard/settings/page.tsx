import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings - OLMA Dashboard',
  description: 'Manage your account settings',
}

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Settings component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}



