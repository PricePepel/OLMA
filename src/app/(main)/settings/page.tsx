import { Metadata } from 'next'
import { SettingsComponent } from '@/components/settings/settings-component'
import { LocationManager } from '@/components/location/location-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Settings - OLMA',
  description: 'Manage your account settings',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and privacy
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <SettingsComponent />
        </TabsContent>
        
        <TabsContent value="location" className="mt-6">
          <LocationManager userId="current-user-id" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
