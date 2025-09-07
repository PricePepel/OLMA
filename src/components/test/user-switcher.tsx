'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

// Test users for demonstration
const TEST_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Sarah Johnson',
    username: 'sarah_photo',
    email: 'photography.teacher@test.com',
    skill: 'Photography Teacher',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Mike Chen',
    username: 'mike_guitar',
    email: 'guitar.teacher@test.com',
    skill: 'Guitar Teacher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Emma Rodriguez',
    username: 'emma_cooks',
    email: 'cooking.teacher@test.com',
    skill: 'Cooking Teacher',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
]

export function UserSwitcher() {
  const { user } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const handleSwitchUser = async (userId: string) => {
    setSelectedUserId(userId)
    
    // In a real app, you would:
    // 1. Sign out the current user
    // 2. Sign in as the test user
    // 3. Redirect to messages
    
    // For now, just show a message
    alert(`To test messaging as ${TEST_USERS.find(u => u.id === userId)?.name}:\n\n1. Sign out of your current account\n2. Sign up with their email: ${TEST_USERS.find(u => u.id === userId)?.email}\n3. Use password: testpassword123\n4. Check your messages!`)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Test User Switcher
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Switch between test users to see messages from different perspectives
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Current User:</strong> {user?.email}
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium">Test Teachers:</h4>
          {TEST_USERS.map((testUser) => (
            <div key={testUser.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={testUser.avatar} 
                  alt={testUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{testUser.name}</p>
                  <p className="text-sm text-muted-foreground">{testUser.skill}</p>
                  <p className="text-xs text-muted-foreground">{testUser.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSwitchUser(testUser.id)}
                disabled={selectedUserId === testUser.id}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Test Messages
              </Button>
            </div>
          ))}
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> To see messages from the teacher's perspective, you need to sign up with their email address and check the messages page.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


