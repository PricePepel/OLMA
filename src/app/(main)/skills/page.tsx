import { Metadata } from 'next'
import { SkillsDirectoryComponent } from '@/components/skills/skills-directory-component'

export const metadata: Metadata = {
  title: 'Skills Directory - OLMA',
  description: 'Discover and connect with people who can teach you new skills',
}

export default function SkillsPage() {
  return <SkillsDirectoryComponent />
}
