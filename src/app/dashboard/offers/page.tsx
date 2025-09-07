import { Metadata } from 'next'
import { OffersPage } from '@/components/offers/offers-page'

export const metadata: Metadata = {
  title: 'Offers - OLMA Dashboard',
  description: 'View and manage your meeting invitations and offers',
}

export default function DashboardOffersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
        <p className="text-muted-foreground">
          View and manage your meeting invitations and offers
        </p>
      </div>
      
      <OffersPage />
    </div>
  )
}

