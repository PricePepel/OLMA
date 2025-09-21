import { Metadata } from 'next'
import { SkillMatcher } from '@/components/skills/skill-matcher'

export const metadata: Metadata = {
  title: 'Find Teachers - OLMA',
  description: 'Find people who can teach the skills you want to learn',
}

export default function FindTeachersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Teachers</h1>
        <p className="text-muted-foreground">
          Discover people who can teach the skills you want to learn
        </p>
      </div>
      
      <SkillMatcher />
    </div>
  )
}










