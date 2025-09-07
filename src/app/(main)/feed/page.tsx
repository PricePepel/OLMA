import { Metadata } from 'next'
import { FeedComponent } from '@/components/feed/feed-component'

export const metadata: Metadata = {
  title: 'Feed - OLMA',
  description: 'Share and discover posts from the community',
}

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
        <p className="text-muted-foreground">
          Share and discover posts from the community
        </p>
      </div>
      
      <FeedComponent />
    </div>
  )
}
