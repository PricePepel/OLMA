'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Coins, 
  Star, 
  Crown, 
  Palette, 
  Award
} from 'lucide-react'

export function SimpleShop() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Badge Shop</h2>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">0</span>
        </div>
      </div>

      {/* Badge Categories */}
      <Tabs defaultValue="frames" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frames" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Frames
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Backgrounds
          </TabsTrigger>
          <TabsTrigger value="accents" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Accents
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frames" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Classic Frame</CardTitle>
                <Badge className="bg-gray-100 text-gray-800">common</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A clean, minimalist frame for your profile
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">50</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Golden Frame</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">rare</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  An elegant golden border for your profile
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">150</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Diamond Frame</CardTitle>
                <Badge className="bg-purple-100 text-purple-800">epic</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A sparkling diamond-studded frame
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">300</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backgrounds" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ocean Breeze</CardTitle>
                <Badge className="bg-gray-100 text-gray-800">common</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A calming ocean-themed background
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">100</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Learning Star</CardTitle>
                <Badge className="bg-gray-100 text-gray-800">common</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A star that shows your dedication to learning
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">75</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Early Adopter</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">legendary</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For users who joined OLMA early
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">0</span>
                  </div>
                </div>
                <Button size="sm" className="w-full" disabled>
                  <Crown className="h-4 w-4 mr-2" />
                  Special
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
