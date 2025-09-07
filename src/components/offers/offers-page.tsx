'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Check, 
  X, 
  Play, 
  Pause,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookOpen
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { toast } from 'sonner'

interface Offer {
  id: string
  conversation_id: string
  inviter_id: string
  invitee_id: string
  skill_id: string
  meeting_location: string
  meeting_date: string
  meeting_duration: number
  status: 'pending' | 'accepted' | 'denied' | 'started' | 'completed' | 'cancelled'
  inviter_message?: string
  invitee_response?: string
  created_at: string
  updated_at: string
  skill: {
    id: string
    name: string
    category: string
  }
  inviter: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  invitee: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  other_user: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  is_inviter: boolean
  currency_amount: number
  currency_type: 'earned' | 'spent'
  formatted_date: string
  formatted_time: string
}

interface OfferStats {
  total: number
  pending: number
  accepted: number
  completed: number
  denied: number
  started: number
  cancelled: number
  totalEarned: number
  totalSpent: number
  totalHours: number
}

export function OffersPage() {
  const { user } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Fetch offers
  const { data: offers, isLoading: offersLoading, refetch: refetchOffers } = useApi<Offer[]>({
    url: `/api/offers${selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''}`,
    method: 'GET'
  })

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useApi<OfferStats>({
    url: '/api/offers/stats',
    method: 'GET'
  })

  const handleStatusChange = async (offerId: string, newStatus: string, inviteeResponse?: string) => {
    try {
      const response = await fetch(`/api/meetings/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          invitee_response: inviteeResponse
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to update offer status')
      }

      toast.success(`Offer ${newStatus} successfully!`)
      refetchOffers()

    } catch (error) {
      console.error('Offer status update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update offer status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'denied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'started': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'accepted': return 'Accepted'
      case 'denied': return 'Denied'
      case 'started': return 'Started'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const filteredOffers = offers || []

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${statsLoading ? '...' : stats?.totalEarned || 0}
            </div>
            <p className="text-xs text-muted-foreground">From teaching</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${statsLoading ? '...' : stats?.totalSpent || 0}
            </div>
            <p className="text-xs text-muted-foreground">On learning</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : stats?.totalHours || 0}h
            </div>
            <p className="text-xs text-muted-foreground">Completed sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Offers Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" onClick={() => setSelectedStatus('all')}>
            All ({stats?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setSelectedStatus('pending')}>
            Pending ({stats?.pending || 0})
          </TabsTrigger>
          <TabsTrigger value="accepted" onClick={() => setSelectedStatus('accepted')}>
            Accepted ({stats?.accepted || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" onClick={() => setSelectedStatus('completed')}>
            Completed ({stats?.completed || 0})
          </TabsTrigger>
          <TabsTrigger value="denied" onClick={() => setSelectedStatus('denied')}>
            Denied ({stats?.denied || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          {offersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="space-y-4">
              {filteredOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{offer.skill.name}</h3>
                            <Badge className={getStatusColor(offer.status)}>
                              {getStatusText(offer.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>with {offer.other_user.full_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{offer.formatted_date} at {offer.formatted_time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{offer.meeting_location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{offer.meeting_duration} minutes</span>
                            </div>
                          </div>

                          {offer.inviter_message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">{offer.inviter.full_name}:</span> {offer.inviter_message}
                              </p>
                            </div>
                          )}

                          {offer.invitee_response && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">{offer.invitee.full_name}:</span> {offer.invitee_response}
                              </p>
                            </div>
                          )}

                          {offer.status === 'completed' && offer.currency_amount > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                {offer.currency_type === 'earned' ? 'Earned' : 'Spent'}: ${offer.currency_amount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2">
                        {offer.status === 'pending' && !offer.is_inviter && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(offer.id, 'accepted')}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(offer.id, 'denied')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Deny
                            </Button>
                          </>
                        )}

                        {offer.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(offer.id, 'started')}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}

                        {offer.status === 'started' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(offer.id, 'completed')}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}

                        {(offer.status === 'denied' || offer.status === 'cancelled') && (
                          <div className="text-center text-sm text-muted-foreground">
                            This offer has been {offer.status}
                          </div>
                        )}

                        {offer.status === 'completed' && (
                          <div className="text-center text-sm text-green-600 dark:text-green-400">
                            Meeting completed! 🎉
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No offers found</h3>
                <p className="text-muted-foreground">
                  {selectedStatus === 'all' 
                    ? "You haven't made or received any meeting invitations yet."
                    : `No ${selectedStatus} offers found.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


