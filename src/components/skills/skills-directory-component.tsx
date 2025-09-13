'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Code, 
  Languages, 
  Palette, 
  Briefcase, 
  Heart, 
  Utensils,
  BookOpen,
  GraduationCap,
  Star,
  MapPin,
  Calculator,
  Cpu,
  Globe,
  Music,
  MessageSquare,
  Building,
  Dumbbell,
  Coffee,
  Zap,
  Camera,
  Gamepad2
} from 'lucide-react'
import Link from 'next/link'

interface Skill {
  id: string
  name: string
  category: string
  description: string
  icon: string
}

interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency_level: number
  can_teach: boolean
  can_learn: boolean
  hourly_rate: number | null
  skill: Skill
  user: {
    id: string
    full_name: string
    username: string
    avatar_url: string
    location: string
  }
}

const categoryIcons: Record<string, any> = {
  'Academic Sciences': Calculator,
  'IT & Digital Skills': Cpu,
  'Languages': Languages,
  'Creativity & Arts': Palette,
  'Soft Skills': MessageSquare,
  'Careers & Professions': Building,
  'Sports & Health': Dumbbell,
  'Hobbies & Everyday Skills': Coffee,
  // Legacy categories for backward compatibility
  'Programming': Code,
  'Arts': Palette,
  'Business': Briefcase,
  'Fitness': Heart,
  'Life Skills': Utensils,
}

export function SkillsDirectoryComponent() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSkills()
    fetchUserSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      if (data.skills) {
        setSkills(data.skills)
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    }
  }

  const fetchUserSkills = async () => {
    try {
      const response = await fetch('/api/user-skills/all')
      const data = await response.json()
      if (data.userSkills) {
        setUserSkills(data.userSkills)
      }
    } catch (error) {
      console.error('Failed to fetch user skills:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || BookOpen
    return <IconComponent className="h-5 w-5" />
  }

  const getProficiencyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Elementary'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Unknown'
    }
  }

  const getProficiencyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 5: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredUserSkills = userSkills.filter(userSkill => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'teach' && userSkill.can_teach) return true
    if (selectedFilter === 'learn' && userSkill.can_learn) return true
    return false
  })

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))]
  const filters = [
    { value: 'all', label: 'All Skills' },
    { value: 'teach', label: 'Can Teach' },
    { value: 'learn', label: 'Want to Learn' },
  ]

  const getSkillStats = (skillId: string) => {
    const skillUserSkills = userSkills.filter(us => us.skill_id === skillId)
    const canTeach = skillUserSkills.filter(us => us.can_teach).length
    const wantToLearn = skillUserSkills.filter(us => us.can_learn).length
    const avgRate = skillUserSkills
      .filter(us => us.hourly_rate)
      .reduce((sum, us) => sum + (us.hourly_rate || 0), 0) / 
      skillUserSkills.filter(us => us.hourly_rate).length || 0

    return { canTeach, wantToLearn, avgRate }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Skills Directory</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover skills in your community and connect with people who can teach or learn from you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for skills like 'JavaScript', 'Cooking', 'Yoga'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Skills" />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-6">
        {filteredSkills.map((skill) => {
          const stats = getSkillStats(skill.id)
          const IconComponent = categoryIcons[skill.category] || BookOpen

          return (
            <Card key={skill.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{skill.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{skill.category}</Badge>
                        {stats.canTeach > 0 && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {stats.canTeach} can teach
                          </Badge>
                        )}
                        {stats.wantToLearn > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {stats.wantToLearn} want to learn
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {stats.avgRate > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${Math.round(stats.avgRate)}
                      </div>
                      <div className="text-sm text-muted-foreground">avg/hr</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{skill.description}</p>
                
                {/* People with this skill */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">People with this skill:</h4>
                  <div className="space-y-2">
                    {filteredUserSkills
                      .filter(us => us.skill_id === skill.id)
                      .slice(0, 3)
                      .map((userSkill) => (
                        <div key={userSkill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {userSkill.user.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{userSkill.user.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{userSkill.user.username}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {userSkill.can_teach && (
                              <Badge className="bg-green-100 text-green-800">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Can Teach
                              </Badge>
                            )}
                            {userSkill.can_learn && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <BookOpen className="h-3 w-3 mr-1" />
                                Want to Learn
                              </Badge>
                            )}
                            <Badge className={getProficiencyColor(userSkill.proficiency_level)}>
                              {getProficiencyLabel(userSkill.proficiency_level)}
                            </Badge>
                            {userSkill.hourly_rate && (
                              <Badge variant="outline">
                                ${userSkill.hourly_rate}/hr
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {filteredUserSkills.filter(us => us.skill_id === skill.id).length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View All ({filteredUserSkills.filter(us => us.skill_id === skill.id).length})
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn This Skill
                  </Button>
                  <Button className="flex-1">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Find Teachers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No skills found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or category filters
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Ready to share your skills?</h3>
          <p className="text-muted-foreground mb-4">
            Add your skills to your profile and start connecting with others
          </p>
          <Link href="/dashboard/skills">
            <Button size="lg">
              {/* Plus icon is not imported, so it's commented out */}
              {/* <Plus className="h-4 w-4 mr-2" /> */}
              Add Your Skills
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
