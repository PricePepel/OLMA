import { Metadata } from 'next'
import { ClubDetailComponent } from '@/components/clubs/club-detail-component'

export const metadata: Metadata = {
  title: 'Club Details - OLMA',
  description: 'View club details and events',
}

interface ClubPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { id } = await params
  return (
    <div className="space-y-6">
      <ClubDetailComponent clubId={id} />
    </div>
  )
}
