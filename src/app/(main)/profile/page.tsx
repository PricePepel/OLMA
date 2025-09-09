import { Metadata } from 'next'
import { ProfileComponent } from '@/components/profile/profile-component'

export const metadata: Metadata = {
  title: 'Profile - OLMA',
  description: 'View and edit your profile',
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and edit your profile information
        </p>
      </div>
      
      <ProfileComponent />
    </div>
  )
}









