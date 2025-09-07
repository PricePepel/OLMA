import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reports - OLMA Dashboard',
  description: 'View and manage reports',
}

export default function DashboardReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View and manage reports
        </p>
      </div>
      
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Reports component will be implemented here</p>
        </div>
      </div>
    </div>
  )
}



