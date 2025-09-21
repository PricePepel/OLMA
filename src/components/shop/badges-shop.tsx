'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ShoppingCart, 
  Coins, 
  Star, 
  Crown, 
  Palette, 
  Award, 
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'

interface ProfileBadge {
  id: string
  name: string
  description: string
  category: 'frame' | 'background' | 'accent' | 'special'
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon_url?: string
  is_owned: boolean
  is_equipped: boolean
}

interface UserWallet {
  id: string
  profile_id: string
  type: 'personal' | 'club'
  balance: number
}

interface BadgesShopProps {
  className?: string
}

export function BadgesShop({ className }: BadgesShopProps) {
  const { profile } = useAuth()
  const [selectedBadge, setSelectedBadge] = useState<ProfileBadge | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isEquipping, setIsEquipping] = useState(false)

  const { data: badges, isLoading: badgesLoading, refetch: refetchBadges } = useApi<ProfileBadge[]>({
    url: '/api/shop/badges',
    method: 'GET'
  })

  const { data: userWallet, isLoading: walletLoading } = useApi<UserWallet>({
    url: '/api/currency/wallets/personal',
    method: 'GET'
  })

  const { data: userBadges, refetch: refetchUserBadges } = useApi<{
    badges: any[]
    equipped: any[]
  }>({
    url: '/api/user/badges',
    method: 'GET'
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frame': return <Palette className="h-4 w-4" />
      case 'background': return <Award className="h-4 w-4" />
      case 'accent': return <Star className="h-4 w-4" />
      case 'special': return <Crown className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'frame': return 'Profile Frames'
      case 'background': return 'Backgrounds'
      case 'accent': return 'Accents'
      case 'special': return 'Special Badges'
      default: return 'Other'
    }
  }

  const handlePurchase = async (badge: ProfileBadge) => {
    if (!userWallet) {
      toast.error('Unable to access wallet')
      return
    }

    if (userWallet.balance < badge.price) {
      toast.error('Insufficient funds')
      return
    }

    setIsPurchasing(true)
    try {
      const response = await fetch('/api/shop/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badge_id: badge.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Purchase failed')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(`Successfully purchased ${badge.name}!`)
        refetchBadges()
        refetchUserBadges()
        setIsPurchaseDialogOpen(false)
      } else {
        throw new Error(result.error || 'Purchase failed')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to purchase badge')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleEquip = async (badge: ProfileBadge, equip: boolean) => {
    setIsEquipping(true)
    try {
      const response = await fetch('/api/user/badges', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badge_id: badge.id,
          equip: equip
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to update badge')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        refetchBadges()
        refetchUserBadges()
      } else {
        throw new Error(result.error || 'Failed to update badge')
      }
    } catch (error) {
      console.error('Equip error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update badge')
    } finally {
      setIsEquipping(false)
    }
  }

  const groupedBadges = badges?.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = []
    }
    acc[badge.category].push(badge)
    return acc
  }, {} as Record<string, ProfileBadge[]>) || {}

  if (badgesLoading || walletLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Badge Shop</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Badge Shop</h2>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">{userWallet?.balance || 0}</span>
        </div>
      </div>

      {/* Badge Categories */}
      <Tabs defaultValue={Object.keys(groupedBadges)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(groupedBadges).map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {getCategoryName(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBadges.map((badge) => (
                <Card key={badge.id} className="relative overflow-hidden">
                  {badge.is_owned && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt={badge.name} className="h-8 w-8" />
                        ) : (
                          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getCategoryIcon(badge.category)}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          <Badge className={getRarityColor(badge.rarity)}>
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription>{badge.description}</CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{badge.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {badge.is_owned ? (
                        <>
                          <Button
                            variant={badge.is_equipped ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEquip(badge, !badge.is_equipped)}
                            disabled={isEquipping}
                          >
                            {badge.is_equipped ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Equipped
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Equip
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedBadge(badge)
                            setIsPurchaseDialogOpen(true)
                          }}
                          disabled={!userWallet || userWallet.balance < badge.price}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase Badge
            </DialogTitle>
            <DialogDescription>
              Confirm your purchase of this profile badge
            </DialogDescription>
          </DialogHeader>

          {selectedBadge && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {selectedBadge.icon_url ? (
                  <img src={selectedBadge.icon_url} alt={selectedBadge.name} className="h-12 w-12" />
                ) : (
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedBadge.category)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{selectedBadge.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBadge.description}</p>
                  <Badge className={getRarityColor(selectedBadge.rarity)}>
                    {selectedBadge.rarity}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Price: {selectedBadge.price} coins</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Your balance: {userWallet?.balance || 0} coins
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPurchaseDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePurchase(selectedBadge)}
                  disabled={isPurchasing || !userWallet || userWallet.balance < selectedBadge.price}
                  className="flex-1"
                >
                  {isPurchasing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
