import { Metadata } from 'next'
import { ClubsComponent } from '@/components/clubs/clubs-component'

export const metadata: Metadata = {
  title: 'Clubs - OLMA',
  description: 'Join clubs and participate in events with like-minded learners',
}

export default function ClubsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clubs</h1>
        <p className="text-muted-foreground">
          Join clubs and participate in events with like-minded learners
        </p>
      </div>
      
      <ClubsComponent />
    </div>
  )
}
