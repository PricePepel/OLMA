'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Globe, Eye, EyeOff, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MapLocation {
  lat: number
  lng: number
  title?: string
  description?: string
  privacy?: 'public' | 'club' | 'private'
}

export interface MapStubProps {
  locations?: MapLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  className?: string
  showControls?: boolean
  onLocationClick?: (location: MapLocation) => void
  onMapClick?: (lat: number, lng: number) => void
  readOnly?: boolean
  provider?: 'google' | 'mapbox' | 'openstreetmap'
}

export function MapStub({
  locations = [],
  center = { lat: 37.7749, lng: -122.4194 }, // San Francisco default
  zoom = 12,
  height = '400px',
  className,
  showControls = true,
  onLocationClick,
  onMapClick,
  readOnly = false,
  provider = 'google'
}: MapStubProps) {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  // Check for API keys
  useEffect(() => {
    const checkApiKeys = () => {
      switch (provider) {
        case 'google':
          setHasApiKey(!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
          break
        case 'mapbox':
          setHasApiKey(!!process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
          break
        case 'openstreetmap':
          setHasApiKey(true) // OpenStreetMap is free
          break
        default:
          setHasApiKey(false)
      }
    }

    checkApiKeys()
    setIsLoading(false)
  }, [provider])

  // Initialize map when API key is available
  useEffect(() => {
    if (!hasApiKey || isLoading) return

    const initMap = async () => {
      try {
        switch (provider) {
          case 'google':
            await initGoogleMap()
            break
          case 'mapbox':
            await initMapboxMap()
            break
          case 'openstreetmap':
            await initOpenStreetMap()
            break
        }
      } catch (err) {
        setError(`Failed to load ${provider} map: ${err}`)
      }
    }

    initMap()
  }, [hasApiKey, provider, center, zoom])

  const initGoogleMap = async () => {
    // Google Maps implementation stub
    // In production, this would load the Google Maps JavaScript API
    console.log('Google Maps would be initialized here')
    setMapInstance({ type: 'google', center, zoom })
  }

  const initMapboxMap = async () => {
    // Mapbox implementation stub
    // In production, this would load the Mapbox GL JS
    console.log('Mapbox would be initialized here')
    setMapInstance({ type: 'mapbox', center, zoom })
  }

  const initOpenStreetMap = async () => {
    // OpenStreetMap implementation stub
    // In production, this would load Leaflet with OpenStreetMap tiles
    console.log('OpenStreetMap would be initialized here')
    setMapInstance({ type: 'openstreetmap', center, zoom })
  }

  const handleMapClick = (event: React.MouseEvent) => {
    if (readOnly || !onMapClick) return
    
    // In a real implementation, this would convert screen coordinates to lat/lng
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Simplified conversion (this is just a stub)
    const lat = center.lat + (y - rect.height / 2) * 0.001
    const lng = center.lng + (x - rect.width / 2) * 0.001
    
    onMapClick(lat, lng)
  }

  const formatDistance = (lat: number, lng: number): string => {
    const distance = Math.sqrt(
      Math.pow(lat - center.lat, 2) + Math.pow(lng - center.lng, 2)
    ) * 111 // Rough conversion to km
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)} style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Navigation className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasApiKey) {
    return (
      <Card className={cn('border-dashed', className)} style={{ height }}>
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <Globe className="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map Preview</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {provider === 'openstreetmap' 
              ? 'OpenStreetMap integration not configured'
              : `${provider.charAt(0).toUpperCase() + provider.slice(1)} Maps API key not configured`
            }
          </p>
          
          {/* Static map preview */}
          <div className="w-full max-w-md bg-muted rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <MapPin className="h-6 w-6 mx-auto text-primary" />
              <p className="text-sm font-medium">Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
            </div>
            
            {locations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Nearby locations:</p>
                {locations.slice(0, 3).map((location, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate">
                      {location.title || `Location ${index + 1}`}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatDistance(location.lat, location.lng)}
                    </Badge>
                  </div>
                ))}
                {locations.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{locations.length - 3} more locations
                  </p>
                )}
              </div>
            )}
          </div>

          {showControls && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Settings className="h-4 w-4 mr-1" />
                Configure API Key
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('border-destructive', className)} style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Navigation className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Interactive map stub (when API key is available)
  return (
    <Card className={cn('relative', className)} style={{ height }}>
      <CardContent className="p-0 h-full">
        <div 
          className="w-full h-full bg-muted relative cursor-pointer"
          onClick={handleMapClick}
        >
          {/* Map container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{provider.charAt(0).toUpperCase() + provider.slice(1)} Map</p>
              <p className="text-xs text-muted-foreground">
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)} • Zoom: {zoom}
              </p>
            </div>
          </div>

          {/* Location markers */}
          {locations.map((location, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
              style={{
                left: `${50 + (location.lng - center.lng) * 1000}%`,
                top: `${50 - (location.lat - center.lat) * 1000}%`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                onLocationClick?.(location)
              }}
            >
              <div className="relative">
                <MapPin className="h-6 w-6 text-primary" />
                {location.privacy === 'private' && (
                  <EyeOff className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
                )}
                {location.title && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs whitespace-nowrap">
                    {location.title}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Map controls */}
          {showControls && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                +
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                -
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
