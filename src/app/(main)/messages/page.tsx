import { Metadata } from 'next'
import { MessagesComponent } from '@/components/messages/messages-component'

export const metadata: Metadata = {
  title: 'Messages - OLMA',
  description: 'Connect with other learners and teachers',
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Connect with other learners and teachers
        </p>
      </div>
      
      <MessagesComponent />
    </div>
  )
}
