import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Currency - OLMA Dashboard',
  description: 'Manage your personal currency',
}

export default function DashboardCurrencyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Currency</h1>
        <p className="text-muted-foreground">
          Manage your personal currency and transactions
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Currency component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}






