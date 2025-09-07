import { Metadata } from 'next'
import { UserSkillsManager } from '@/components/skills/user-skills-manager'

export const metadata: Metadata = {
  title: 'My Skills - OLMA Dashboard',
  description: 'Manage your skills and let others know what you can teach or learn',
}

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills Management</h1>
        <p className="text-muted-foreground">
          Build your skills profile and connect with others who can teach or learn from you
        </p>
      </div>
      
      <UserSkillsManager />
    </div>
  )
}



