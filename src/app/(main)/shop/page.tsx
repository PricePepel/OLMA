import { Metadata } from 'next'
import { ShopComponent } from '@/components/shop/shop-component'

export const metadata: Metadata = {
  title: 'Shop - OLMA',
  description: 'Spend your earned currency',
}

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="text-muted-foreground">
          Spend your earned currency on cosmetics and features
        </p>
      </div>
      <ShopComponent />
    </div>
  )
}
