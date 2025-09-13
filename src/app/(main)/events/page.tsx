import { Metadata } from 'next'
import { EventsComponent } from '@/components/events/events-component'

export const metadata: Metadata = {
  title: 'Events - OLMA',
  description: 'Discover and join events in your community',
}

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Discover and join events in your community
        </p>
      </div>
      
      <EventsComponent />
    </div>
  )
}











