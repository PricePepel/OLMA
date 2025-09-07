import { Metadata } from 'next'
import { MessagesComponent } from '@/components/messages/messages-component'
import { UserSwitcher } from '@/components/test/user-switcher'

export const metadata: Metadata = {
  title: 'Messages - OLMA Dashboard',
  description: 'View and manage your messages',
}

export default function DashboardMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          View and manage your conversations
        </p>
      </div>
      
      {/* Test User Switcher - Remove this in production */}
      <UserSwitcher />
      
      <MessagesComponent />
    </div>
  )
}

