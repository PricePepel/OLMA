import { Metadata } from 'next'
import { ReportsComponent } from '@/components/reports/reports-component'

export const metadata: Metadata = {
  title: 'Reports - OLMA',
  description: 'Manage your reports and violations',
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Manage your reports and violations
        </p>
      </div>
      
      <ReportsComponent />
    </div>
  )
}










