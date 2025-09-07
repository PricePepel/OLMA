'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { MapPin, Navigation, Eye, EyeOff, Globe, Map } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { MapStub, MapLocation } from '@/components/ui/map-stub'
import { getCurrentLocation, roundCoordinates, validateCoordinates, getLocationPrivacyLevel } from '@/lib/geo'

interface LocationManagerProps {
  userId: string
  initialLocation?: {
    latitude: number
    longitude: number
    address_text?: string
    privacy_level: 'public' | 'club' | 'private'
  }
  onLocationUpdate?: (location: any) => void
  className?: string
}

export function LocationManager({
  userId,
  initialLocation,
  onLocationUpdate,
  className
}: LocationManagerProps) {
  const [location, setLocation] = useState({
    latitude: initialLocation?.latitude || 0,
    longitude: initialLocation?.longitude || 0,
    address_text: initialLocation?.address_text || '',
    privacy_level: initialLocation?.privacy_level || 'private'
  })
  
  const [isSharing, setIsSharing] = useState(!!initialLocation?.latitude)
  const [isLoading, setIsLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [privacyPreference, setPrivacyPreference] = useState<'never' | 'contextual' | 'club_only' | 'always_public'>('contextual')

  const { mutate: updateLocation, isLoading: isUpdating } = useApi({
    url: '/api/locations',
    method: 'POST',
    onSuccess: (data) => {
      toast.success('Location updated successfully')
      onLocationUpdate?.(data)
    },
    onError: (error) => {
      toast.error(`Failed to update location: ${error}`)
    }
  })

  const handleDetectLocation = async () => {
    setIsDetecting(true)
    try {
      const coords = await getCurrentLocation()
      const rounded = roundCoordinates(coords.lat, coords.lng)
      
      setLocation(prev => ({
        ...prev,
        latitude: rounded.lat,
        longitude: rounded.lng
      }))
      
      toast.success('Location detected and rounded for privacy')
    } catch (error) {
      toast.error('Failed to detect location. Please check your browser permissions.')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleManualInput = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setLocation(prev => ({
        ...prev,
        [field]: numValue
      }))
    }
  }

  const handlePrivacyChange = (newPrivacy: 'public' | 'club' | 'private') => {
    setLocation(prev => ({
      ...prev,
      privacy_level: newPrivacy
    }))
  }

  const handleSaveLocation = () => {
    if (!validateCoordinates(location.latitude, location.longitude)) {
      toast.error('Invalid coordinates')
      return
    }

    const effectivePrivacy = getLocationPrivacyLevel(privacyPreference, 'profile')
    
    updateLocation({
      user_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      address_text: location.address_text,
      privacy_level: effectivePrivacy
    })
  }

  const handleToggleSharing = (enabled: boolean) => {
    setIsSharing(enabled)
    if (!enabled) {
      setLocation(prev => ({
        ...prev,
        latitude: 0,
        longitude: 0,
        address_text: ''
      }))
    }
  }

  const mapLocations: MapLocation[] = isSharing && location.latitude && location.longitude ? [
    {
      lat: location.latitude,
      lng: location.longitude,
      title: 'Your Location',
      description: location.address_text || 'Your approximate location',
      privacy: location.privacy_level
    }
  ] : []

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Control how and where your location is shared with the community
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location Sharing Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Share Location</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to see your approximate location for meetups and offers
            </p>
          </div>
          <Switch
            checked={isSharing}
            onCheckedChange={handleToggleSharing}
          />
        </div>

        {isSharing && (
          <>
            {/* Location Detection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Current Location</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {isDetecting ? 'Detecting...' : 'Detect Location'}
                </Button>
              </div>

              {/* Manual Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={location.latitude || ''}
                    onChange={(e) => handleManualInput('latitude', e.target.value)}
                    placeholder="37.7749"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={location.longitude || ''}
                    onChange={(e) => handleManualInput('longitude', e.target.value)}
                    placeholder="-122.4194"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={location.address_text}
                  onChange={(e) => setLocation(prev => ({ ...prev, address_text: e.target.value }))}
                  placeholder="San Francisco, CA"
                />
              </div>

              {/* Privacy Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Privacy Preference</Label>
                  <Select value={privacyPreference} onValueChange={(value: any) => setPrivacyPreference(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never share location</SelectItem>
                      <SelectItem value="contextual">Share based on context</SelectItem>
                      <SelectItem value="club_only">Share with club members only</SelectItem>
                      <SelectItem value="always_public">Always share publicly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Privacy Level</Label>
                  <div className="flex items-center gap-2">
                    {location.privacy_level === 'private' ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : location.privacy_level === 'club' ? (
                      <Globe className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-500" />
                    )}
                    <Badge variant={
                      location.privacy_level === 'private' ? 'secondary' :
                      location.privacy_level === 'club' ? 'default' : 'default'
                    }>
                      {location.privacy_level === 'private' ? 'Private' :
                       location.privacy_level === 'club' ? 'Club Only' : 'Public'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              {location.latitude && location.longitude && (
                <div className="space-y-2">
                  <Label>Location Preview</Label>
                  <MapStub
                    locations={mapLocations}
                    center={{ lat: location.latitude, lng: location.longitude }}
                    height="200px"
                    showControls={false}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Your location is rounded to ~1km precision for privacy
                  </p>
                </div>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSaveLocation}
                disabled={isUpdating || !location.latitude || !location.longitude}
                className="w-full"
              >
                {isUpdating ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </>
        )}

        {!isSharing && (
          <div className="text-center py-8 text-muted-foreground">
            <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Location sharing is disabled</p>
            <p className="text-sm">Enable location sharing to participate in local meetups and offers</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
