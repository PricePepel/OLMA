import { Metadata } from 'next'
import { CurrencyComponent } from '@/components/currency/currency-component'

export const metadata: Metadata = {
  title: 'Currency - OLMA',
  description: 'Manage your currency and transactions',
}

export default function CurrencyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Currency</h1>
        <p className="text-muted-foreground">
          Manage your currency and transactions
        </p>
      </div>
      
      <CurrencyComponent />
    </div>
  )
}





