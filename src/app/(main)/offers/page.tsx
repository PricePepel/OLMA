import { Metadata } from 'next'
import { OffersComponent } from '@/components/offers/offers-component'
import { OffersMapView } from '@/components/offers/offers-map-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, Map } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Skill Offers - OLMA',
  description: 'Find and create skill offers',
}

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Offers</h1>
        <p className="text-muted-foreground">
          Find people to teach or learn skills from
        </p>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <OffersComponent />
        </TabsContent>
        
        <TabsContent value="map" className="mt-6">
          <OffersMapView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
