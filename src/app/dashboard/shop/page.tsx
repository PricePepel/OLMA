import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop - OLMA Dashboard',
  description: 'Browse the shop',
}

export default function DashboardShopPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="text-muted-foreground">
          Browse and purchase items from the shop
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Shop component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}






