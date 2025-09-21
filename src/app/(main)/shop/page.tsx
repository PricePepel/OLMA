import { Metadata } from 'next'
import { ShopComponent } from '@/components/shop/shop-component'
import { SimpleShop } from '@/components/shop/simple-shop'
import { Suspense } from 'react'

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
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🛍️ Badge Shop</h2>
        <p className="text-muted-foreground mb-4">
          Customize your profile with unique badges and frames!
        </p>
        <Suspense fallback={<div className="p-4 text-center">Loading shop...</div>}>
          <SimpleShop />
        </Suspense>
      </div>
    </div>
  )
}
