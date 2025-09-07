'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  ShoppingCart, 
  Coins, 
  Star, 
  Crown, 
  Palette, 
  Award, 
  Zap,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { formatCurrency } from '@/lib/gamification'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  currency_type: 'personal' | 'club'
  item_type: string
  image_url?: string
  is_available: boolean
  created_at: string
}

interface UserWallet {
  id: string
  profile_id: string
  type: 'personal' | 'club'
  balance: number
}

interface ShopComponentProps {
  className?: string
}

export function ShopComponent({ className }: ShopComponentProps) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<string[]>([])
  const [isPurchasing, setIsPurchasing] = useState(false)

  const { data: shopItems, isLoading: itemsLoading, error: itemsError } = useApi<ShopItem[]>({
    url: '/api/shop/items',
    method: 'GET'
  })

  const { data: walletData, isLoading: walletLoading, error: walletError } = useApi<UserWallet>({
    url: '/api/currency/wallets/personal',
    method: 'GET'
  })

  const { data: purchasesData, isLoading: purchasesLoading } = useApi<{ item_id: string }[]>({
    url: '/api/shop/purchases',
    method: 'GET'
  })



  useEffect(() => {
    if (shopItems) {
      setItems(shopItems)
    }
  }, [shopItems])

  useEffect(() => {
    if (walletData) {
      setUserWallet(walletData)
    }
  }, [walletData])

  useEffect(() => {
    if (purchasesData) {
      setPurchasedItems(purchasesData.map(p => p.item_id))
    }
  }, [purchasesData])

  const handlePurchase = async (item: ShopItem) => {
    if (!userWallet) {
      toast.error('Unable to access wallet')
      return
    }

    if (userWallet.balance < item.price) {
      toast.error('Insufficient funds')
      return
    }

    setIsPurchasing(true)
    try {
      const response = await fetch('/api/currency/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_item_id: item.id
        })
      })

      if (!response.ok) {
        throw new Error('Purchase failed')
      }

      const result = await response.json()

      if (result.data) {
        toast.success(`Successfully purchased ${item.name}!`)
        setUserWallet(prev => prev ? { ...prev, balance: prev.balance - item.price } : null)
        setPurchasedItems(prev => [...prev, item.id])
        setIsPurchaseDialogOpen(false)
        setSelectedItem(null)
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.')
    } finally {
      setIsPurchasing(false)
    }
  }

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'profile_frame':
        return <Crown className="h-6 w-6" />
      case 'badge':
        return <Award className="h-6 w-6" />
      case 'background':
        return <Palette className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'profile_frame':
        return 'Profile Frame'
      case 'badge':
        return 'Badge'
      case 'background':
        return 'Background'
      default:
        return 'Cosmetic'
    }
  }

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'profile_frame':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'badge':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'background':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredItems = {
    all: items,
    profile_frames: items.filter(item => item.item_type === 'profile_frame'),
    badges: items.filter(item => item.item_type === 'badge'),
    backgrounds: items.filter(item => item.item_type === 'background')
  }

  if (itemsLoading || walletLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (itemsError || walletError) {
    return (
      <Card className="p-6">
        <CardContent className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load shop</h3>
          <p className="text-muted-foreground">
            {itemsError?.message || walletError?.message || 'Please try again later'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Wallet Display */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Personal Currency</h3>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {userWallet ? formatCurrency(userWallet.balance) : '0'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xs text-muted-foreground">
                Earn currency by posting, completing meetups, and maintaining streaks!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Items */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="profile_frames">Frames</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
        </TabsList>

        {Object.entries(filteredItems).map(([category, categoryItems]) => (
          <TabsContent key={category} value={category} className="mt-6">
            {categoryItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new cosmetic items!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map((item) => {
                  const isPurchased = purchasedItems.includes(item.id)
                  const canAfford = userWallet ? userWallet.balance >= item.price : false

                  return (
                    <Card key={item.id} className="relative overflow-hidden">
                      {isPurchased && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Owned
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getItemIcon(item.item_type)}
                            <div>
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <Badge className={getItemTypeColor(item.item_type)}>
                                {getItemTypeLabel(item.item_type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {item.image_url ? (
                          <div className="mb-4 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="mb-4 h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                            {getItemIcon(item.item_type)}
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Coins className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold">{formatCurrency(item.price)}</span>
                          </div>

                          {isPurchased ? (
                            <Button variant="outline" disabled>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Owned
                            </Button>
                          ) : (
                            <Dialog open={isPurchaseDialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                              setIsPurchaseDialogOpen(open)
                              if (!open) setSelectedItem(null)
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  onClick={() => setSelectedItem(item)}
                                  disabled={!canAfford || !item.is_available}
                                  className={!canAfford ? 'opacity-50' : ''}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  {!canAfford ? 'Insufficient Funds' : 'Purchase'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Purchase</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to purchase this item?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    {item.image_url ? (
                                      <img 
                                        src={item.image_url} 
                                        alt={item.name}
                                        className="h-16 w-16 object-contain"
                                      />
                                    ) : (
                                      <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                                        {getItemIcon(item.item_type)}
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-semibold">{item.name}</h4>
                                      <p className="text-sm text-muted-foreground">{item.description}</p>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <Coins className="h-4 w-4 text-yellow-600" />
                                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <span className="text-sm">Current Balance:</span>
                                    <div className="flex items-center space-x-2">
                                      <Coins className="h-4 w-4 text-yellow-600" />
                                      <span className="font-semibold">{formatCurrency(userWallet?.balance || 0)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <span className="text-sm">Remaining Balance:</span>
                                    <div className="flex items-center space-x-2">
                                      <Coins className="h-4 w-4 text-green-600" />
                                      <span className="font-semibold">
                                        {formatCurrency((userWallet?.balance || 0) - item.price)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setIsPurchaseDialogOpen(false)
                                      setSelectedItem(null)
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                                                    <Button
                                    onClick={() => handlePurchase(item)}
                                    disabled={isPurchasing}
                                    className="flex-1"
                                  >
                                    {isPurchasing ? (
                                      <>
                                        <Zap className="h-4 w-4 mr-2 animate-spin" />
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
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
