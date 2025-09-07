import { Metadata } from 'next'
import { ProfileComponent } from '@/components/profile/profile-component'

export const metadata: Metadata = {
  title: 'Profile - OLMA Dashboard',
  description: 'View and edit your profile information',
}

export default function DashboardProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and skills
        </p>
      </div>
      
      <ProfileComponent />
    </div>
  )
}





