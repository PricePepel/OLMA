'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Star,
  Search,
  Filter,
  Code, 
  Languages, 
  Palette, 
  Briefcase, 
  Heart, 
  Utensils,
  Calculator,
  Cpu,
  Globe,
  Music,
  MessageSquare,
  Building,
  Dumbbell,
  Coffee
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

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

interface Skill {
  id: string
  name: string
  category: string
  description: string
  icon: string
}

interface UserSkill {
  id: string
  skill_id: string
  proficiency_level: number
  can_teach: boolean
  can_learn: boolean
  hourly_rate: number | null
  skill: Skill
}

export function UserSkillsManager() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUserSkills, setIsLoadingUserSkills] = useState(false)
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    skillId: '',
    proficiencyLevel: 3,
    canTeach: false,
    canLearn: true,
    hourlyRate: ''
  })

  // Fetch available skills
  useEffect(() => {
    fetchSkills()
  }, [])

  // Fetch user's skills
  useEffect(() => {
    console.log('UserSkillsManager - user changed:', user)
    if (user) {
      fetchUserSkills()
    } else {
      console.log('UserSkillsManager - no user, clearing user skills')
      setUserSkills([])
    }
  }, [user])

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || BookOpen
    return <IconComponent className="h-5 w-5" />
  }

  // Don't render if no user
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to manage your skills.</p>
      </div>
    )
  }

  const fetchSkills = async () => {
    setIsLoadingSkills(true)
    try {
      console.log('Fetching available skills...')
      const response = await fetch('/api/skills')
      const data = await response.json()
      console.log('Skills API response:', data)
      if (data.skills) {
        setSkills(data.skills)
        console.log('Set skills:', data.skills.length, 'skills')
      } else {
        console.warn('No skills in response')
        setSkills([])
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      setSkills([])
    } finally {
      setIsLoadingSkills(false)
    }
  }

  const fetchUserSkills = async () => {
    if (!user) return
    
    setIsLoadingUserSkills(true)
    try {
      console.log('Fetching user skills for user:', user.id)
      const response = await fetch('/api/user/skills')
      console.log('Fetch user skills response status:', response.status)
      
      const data = await response.json()
      console.log('User skills API response:', data)
      
      if (data.data) {
        // Log the response to debug any issues
        console.log('User skills response:', data.data)
        console.log('Number of user skills:', data.data.length)
        
        // Log the first user skill in detail to see its structure
        if (data.data.length > 0) {
          console.log('First user skill structure:', JSON.stringify(data.data[0], null, 2))
          console.log('First user skill skill object:', data.data[0].skill)
          console.log('First user skill skill.id:', data.data[0].skill?.id)
          console.log('First user skill skill.name:', data.data[0].skill?.name)
        }
        
        // Filter out any user skills that don't have proper skill data
        // Note: The API returns 'skill' (singular), not 'skills' (plural)
        const validUserSkills = data.data.filter((us: any) => 
          us && us.skill && us.skill.id && us.skill.name
        )
        
        console.log('Valid user skills after filtering:', validUserSkills.length)
        
        if (validUserSkills.length !== data.data.length) {
          console.warn(`Filtered out ${data.data.length - validUserSkills.length} invalid user skills`)
          // Log the invalid ones
          const invalidSkills = data.data.filter((us: any) => 
            !(us && us.skill && us.skill.id && us.skill.name)
          )
          console.log('Invalid user skills:', invalidSkills)
        }
        
        setUserSkills(validUserSkills)
        console.log('Updated userSkills state with:', validUserSkills.length, 'skills')
      } else {
        console.log('No userSkills in response, setting empty array')
        setUserSkills([])
      }
    } catch (error) {
      console.error('Failed to fetch user skills:', error)
      setUserSkills([])
    } finally {
      setIsLoadingUserSkills(false)
    }
  }

  const fixUserProfile = async () => {
    try {
      console.log('Fixing user profile...')
      const response = await fetch('/api/fix-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Profile fixed:', result)
        toast.success('Profile fixed successfully! You can now add skills.')
        
        // Try adding the skill again
        setTimeout(() => {
          handleAddSkill()
        }, 1000)
      } else {
        const error = await response.json()
        console.error('Failed to fix profile:', error)
        toast.error('Failed to fix profile. Please contact support.')
      }
    } catch (error) {
      console.error('Error fixing profile:', error)
      toast.error('Failed to fix profile')
    }
  }

  const handleAddSkill = async () => {
    if (!user || !formData.skillId) {
      console.error('Missing user or skillId:', { user: !!user, skillId: formData.skillId })
      return
    }

    setIsLoading(true)
    try {
      const requestBody = {
        user_id: user.id,
        skill_id: formData.skillId,
        proficiency_level: formData.proficiencyLevel,
        can_teach: formData.canTeach,
        can_learn: formData.canLearn,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
      }
      
      console.log('Adding skill with data:', requestBody)
      console.log('User ID:', user.id)
      console.log('Skill ID:', formData.skillId)
      
      const response = await fetch('/api/user-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const responseData = await response.json()
        console.log('Success response:', responseData)
        
        toast.success('Skill added successfully!')
        setShowAddForm(false)
        resetForm()
        
        // Refresh the user skills list
        console.log('Refreshing user skills...')
        await fetchUserSkills()
        
        // Also refresh available skills to ensure consistency
        await fetchSkills()
      } else {
        const error = await response.json()
        console.error('Failed to add skill:', error)
        console.error('Response status:', response.status)
        
        // Check if it's a foreign key constraint error
        if (error.error && error.error.includes('foreign key constraint')) {
          toast.error('User profile issue detected. Please fix your profile first.')
          // Show a button to fix the profile
          if (confirm('Would you like to fix your user profile now? This will resolve the issue.')) {
            await fixUserProfile()
          }
        } else {
          toast.error(error.error || 'Failed to add skill')
        }
      }
    } catch (error) {
      console.error('Error adding skill:', error)
      toast.error('Failed to add skill')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSkill = async (userSkillId: string, updates: Partial<UserSkill>) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user-skills/${userSkillId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast.success('Skill updated successfully!')
        setEditingSkill(null)
        fetchUserSkills()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update skill')
      }
    } catch (error) {
      toast.error('Failed to update skill')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSkill = async (userSkillId: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user-skills/${userSkillId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Skill removed successfully!')
        fetchUserSkills()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to remove skill')
      }
    } catch (error) {
      toast.error('Failed to remove skill')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      skillId: '',
      proficiencyLevel: 3,
      canTeach: false,
      canLearn: true,
      hourlyRate: ''
    })
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
    if (!skill || !skill.name || !skill.description || !skill.category) return false
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = skills.length > 0 ? ['all', ...Array.from(new Set(skills.map(s => s.category)))] : ['all']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Skills</h2>
          <p className="text-muted-foreground">
            Manage your skills and let others know what you can teach or learn
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Skill</CardTitle>
            <CardDescription>
              Add a skill to your profile and specify your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading available skills...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill">Select Skill</Label>
                    <Select value={formData.skillId} onValueChange={(value) => setFormData(prev => ({ ...prev, skillId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSkills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.name} ({skill.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proficiency">Proficiency Level</Label>
                    <Select value={formData.proficiencyLevel.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, proficiencyLevel: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Beginner</SelectItem>
                        <SelectItem value="2">2 - Elementary</SelectItem>
                        <SelectItem value="3">3 - Intermediate</SelectItem>
                        <SelectItem value="4">4 - Advanced</SelectItem>
                        <SelectItem value="5">5 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canTeach"
                      checked={formData.canTeach}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canTeach: checked }))}
                    />
                    <Label htmlFor="canTeach">Can Teach</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canLearn"
                      checked={formData.canLearn}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canLearn: checked }))}
                    />
                    <Label htmlFor="canLearn">Want to Learn</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="50"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddSkill} disabled={isLoading || !formData.skillId}>
                    {isLoading ? 'Adding...' : 'Add Skill'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {isLoadingSkills ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Loading available skills...</span>
        </div>
      ) : skills.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
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
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No skills available</p>
        </div>
      )}

      {/* User Skills List */}
      <div className="space-y-4">
        {isLoadingUserSkills ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your skills...</p>
            </CardContent>
          </Card>
        ) : !userSkills || userSkills.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No skills added yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your skills profile by adding your first skill
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </CardContent>
          </Card>
        ) : (
          userSkills
            .filter(userSkill => userSkill.skill) // Filter out user skills without skill data
            .map((userSkill) => (
              <Card key={userSkill.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{userSkill.skill?.name || 'Unknown Skill'}</h3>
                        <Badge variant="secondary">{userSkill.skill?.category || 'Unknown Category'}</Badge>
                        <Badge className={getProficiencyColor(userSkill.proficiency_level)}>
                          {getProficiencyLabel(userSkill.proficiency_level)}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{userSkill.skill?.description || 'No description available'}</p>
                     
                      <div className="flex items-center gap-4 text-sm">
                        {userSkill.can_teach && (
                          <div className="flex items-center gap-1 text-green-600">
                            <GraduationCap className="h-4 w-4" />
                            <span>Can Teach</span>
                          </div>
                        )}
                        {userSkill.can_learn && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <BookOpen className="h-4 w-4" />
                            <span>Want to Learn</span>
                          </div>
                        )}
                        {userSkill.hourly_rate && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Star className="h-4 w-4" />
                            <span>${userSkill.hourly_rate}/hr</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSkill(userSkill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSkill(userSkill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Edit Skill Modal */}
      {editingSkill && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Skill: {editingSkill.skill?.name || 'Unknown Skill'}</CardTitle>
            <CardDescription>
              Update your skill preferences and proficiency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Select 
                  value={editingSkill.proficiency_level.toString()} 
                  onValueChange={(value) => setEditingSkill(prev => prev ? { ...prev, proficiency_level: parseInt(value) } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Elementary</SelectItem>
                    <SelectItem value="3">3 - Intermediate</SelectItem>
                    <SelectItem value="4">4 - Advanced</SelectItem>
                    <SelectItem value="5">5 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={editingSkill.hourly_rate || ''}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, hourly_rate: e.target.value ? parseFloat(e.target.value) : null } : null)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="editCanTeach"
                  checked={editingSkill.can_teach}
                  onCheckedChange={(checked) => setEditingSkill(prev => prev ? { ...prev, can_teach: checked } : null)}
                />
                <Label htmlFor="editCanTeach">Can Teach</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editCanLearn"
                  checked={editingSkill.can_learn}
                  onCheckedChange={(checked) => setEditingSkill(prev => prev ? { ...prev, can_learn: checked } : null)}
                />
                <Label htmlFor="editCanLearn">Want to Learn</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpdateSkill(editingSkill.id, {
                  proficiency_level: editingSkill.proficiency_level,
                  can_teach: editingSkill.can_teach,
                  can_learn: editingSkill.can_learn,
                  hourly_rate: editingSkill.hourly_rate
                })}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Skill'}
              </Button>
              <Button variant="outline" onClick={() => setEditingSkill(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
