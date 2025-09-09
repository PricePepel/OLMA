'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { User, Skill, UserSkillWithSkill } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Star, 
  Trophy, 
  Coins, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface UserSkill {
  id: string
  skill: Skill
  proficiency_level: number
  can_teach: boolean
  can_learn: boolean
  hourly_rate?: number
}

export function ProfileComponent() {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || ''
  })

  // Memoize the user ID to prevent infinite re-renders
  const userId = user?.id

  // Fetch user skills
  const { data: userSkills, isLoading: skillsLoading, refetch: refetchSkills } = useApi<UserSkillWithSkill[]>({
    url: '/api/user/skills',
    enabled: !!userId
  })

  // Fetch available skills for adding
  const { data: availableSkills } = useApi<Skill[]>({
    url: '/api/skills',
    enabled: !!userId
  })

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error('You must be logged in to update your profile')
      return
    }

    setIsLoading(true)
    try {
      await updateProfile(editData)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      avatar_url: profile?.avatar_url || ''
    })
    setIsEditing(false)
  }

  const handleAddSkill = async (skillId: string, canTeach: boolean, canLearn: boolean, level: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/skills/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill_id: skillId,
          can_teach: canTeach,
          can_learn: canLearn,
          proficiency_level: level
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add skill')
      }

      toast.success('Skill added successfully!')
      refetchSkills()
    } catch (error) {
      toast.error('Failed to add skill')
    }
  }

  const handleRemoveSkill = async (skillId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/skills/user/${skillId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove skill')
      }

      toast.success('Skill removed successfully!')
      refetchSkills()
    } catch (error) {
      toast.error('Failed to remove skill')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (level >= 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getProficiencyText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Elementary'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Unknown'
    }
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Skeleton className="h-32 w-32 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile.avatar_url || undefined}
                    onError={() => console.log('Profile avatar image failed to load:', profile.avatar_url)}
                    onLoad={() => console.log('Profile avatar image loaded successfully:', profile.avatar_url)}
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <AvatarUpload
                      currentAvatarUrl={profile.avatar_url || undefined}
                      userName={profile.full_name}
                      onAvatarChange={(url) => {
                        setEditData(prev => ({ ...prev, avatar_url: url }))
                        // Update the profile immediately for better UX
                        updateProfile({ ...profile, avatar_url: url })
                      }}
                      className="scale-75"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                  <Badge variant="secondary">@{profile.username}</Badge>
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground max-w-md">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.level || 1}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.experience_points || 0}</p>
              <p className="text-sm text-muted-foreground">XP</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.personal_currency || 0}</p>
              <p className="text-sm text-muted-foreground">Currency</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.streak_days || 0}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Skills</CardTitle>
              <CardDescription>
                Skills you can teach and learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userSkills && userSkills.length > 0 ? (
                <div className="space-y-4">
                  {userSkills.map((userSkill) => (
                    <div key={userSkill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{userSkill.skill.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getProficiencyColor(userSkill.proficiency_level)}>
                              {getProficiencyText(userSkill.proficiency_level)}
                            </Badge>
                            {userSkill.can_teach && (
                              <Badge variant="secondary">Can Teach</Badge>
                            )}
                            {userSkill.can_learn && (
                              <Badge variant="outline">Can Learn</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(userSkill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No skills yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add skills you can teach or want to learn
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={editData.full_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={editData.username}
                    onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Your username"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Your location"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Avatar</label>
                <AvatarUpload
                  currentAvatarUrl={editData.avatar_url}
                  userName={editData.full_name || 'User'}
                  onAvatarChange={(url) => setEditData(prev => ({ ...prev, avatar_url: url }))}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent activity on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">
                  Start participating in the community to see your activity here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

