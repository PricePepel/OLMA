'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Filter, Users, Star, Map } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { MapStub, MapLocation } from '@/components/ui/map-stub'
import { getCurrentLocation, roundCoordinates } from '@/lib/geo'

interface SkillOffer {
  id: string
  offer_type: 'teach' | 'learn'
  description: string
  price?: number
  availability_json?: any
  geo_opt_in: boolean
  created_at: string
  skills: {
    id: string
    name: string
    description: string
    category: string
    difficulty_level: number
  }
  profiles: {
    id: string
    full_name: string
    username: string
    avatar_url?: string
    rating: number
    level: number
  }
  distance?: number
}

interface OffersMapViewProps {
  className?: string
  onOfferClick?: (offer: SkillOffer) => void
}

export function OffersMapView({ className, onOfferClick }: OffersMapViewProps) {
  const [offers, setOffers] = useState<SkillOffer[]>([])
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([])
  const [filters, setFilters] = useState({
    skillId: '',
    offerType: '',
    radiusKm: 10,
    near: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<SkillOffer | null>(null)

  const { data: offersData, isLoading: isFetching, refetch: fetchOffers } = useApi<SkillOffer[]>({
    url: '/api/offers',
    method: 'GET'
  })

  useEffect(() => {
    if (offersData) {
      setOffers(offersData)
      updateMapLocations(offersData)
    }
  }, [offersData])

  const updateMapLocations = (offersData: SkillOffer[]) => {
    const locations: MapLocation[] = offersData
      .filter(offer => offer.geo_opt_in && offer.distance !== undefined)
      .map(offer => ({
        lat: 0, // This would come from the user's location
        lng: 0, // This would come from the user's location
        title: `${offer.profiles.full_name} - ${offer.skills.name}`,
        description: `${offer.offer_type === 'teach' ? 'Teaching' : 'Learning'} ${offer.skills.name}`,
        privacy: 'public'
      }))
    
    setMapLocations(locations)
  }

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true)
    try {
      const coords = await getCurrentLocation()
      const rounded = roundCoordinates(coords.lat, coords.lng)
      const locationString = `${rounded.lat},${rounded.lng}`
      
      setFilters(prev => ({
        ...prev,
        near: locationString
      }))
      
      toast.success('Location detected and rounded for privacy')
    } catch (error) {
      toast.error('Failed to detect location. Please check your browser permissions.')
    } finally {
      setIsDetectingLocation(false)
    }
  }

  const handleSearch = () => {
    fetchOffers()
  }

  const handleLocationClick = (location: MapLocation) => {
    // Find the offer associated with this location
    const offer = offers.find(o => 
      `${o.profiles.full_name} - ${o.skills.name}` === location.title
    )
    if (offer) {
      setSelectedOffer(offer)
      onOfferClick?.(offer)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    const locationString = `${lat.toFixed(4)},${lng.toFixed(4)}`
    setFilters(prev => ({
      ...prev,
      near: locationString
    }))
  }

  const formatDistance = (distance?: number): string => {
    if (!distance) return 'Unknown'
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  const getMapCenter = () => {
    if (filters.near) {
      const [lat, lng] = filters.near.split(',').map(Number)
      return { lat, lng }
    }
    return { lat: 37.7749, lng: -122.4194 } // San Francisco default
  }

  return (
    <div className={className}>
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Offers Near You
          </CardTitle>
          <CardDescription>
            Discover skill offers from people in your area
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill">Skill</Label>
              <Select value={filters.skillId} onValueChange={(value) => setFilters(prev => ({ ...prev, skillId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All skills</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="cooking">Cooking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={filters.offerType} onValueChange={(value) => setFilters(prev => ({ ...prev, offerType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="teach">Teaching</SelectItem>
                  <SelectItem value="learn">Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Radius (km)</Label>
              <Select value={filters.radiusKm.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, radiusKm: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="37.7749,-122.4194"
                  value={filters.near}
                  onChange={(e) => setFilters(prev => ({ ...prev, near: e.target.value }))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isFetching} className="w-full">
            {isFetching ? 'Searching...' : 'Search Offers'}
          </Button>
        </CardContent>
      </Card>

      {/* Map and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Map View
            </CardTitle>
            <CardDescription>
              {offers.length} offers found
              {filters.near && ` within ${filters.radiusKm}km`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <MapStub
              locations={mapLocations}
              center={getMapCenter()}
              height="400px"
              onLocationClick={handleLocationClick}
              onMapClick={handleMapClick}
              showControls
            />
          </CardContent>
        </Card>

        {/* Results List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Offers ({offers.length})
            </CardTitle>
            <CardDescription>
              Click on an offer to view details
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No offers found in your area</p>
                <p className="text-sm">Try adjusting your search criteria or location</p>
              </div>
            ) : (
              offers.map((offer) => (
                <Card
                  key={offer.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedOffer?.id === offer.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedOffer(offer)
                    onOfferClick?.(offer)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={offer.offer_type === 'teach' ? 'default' : 'secondary'}>
                          {offer.offer_type === 'teach' ? 'Teaching' : 'Learning'}
                        </Badge>
                        <Badge variant="outline">{offer.skills.name}</Badge>
                      </div>
                      {offer.distance && (
                        <Badge variant="outline" className="text-xs">
                          {formatDistance(offer.distance)}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold mb-1">{offer.profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{offer.profiles.rating}</span>
                        </div>
                        <span className="text-muted-foreground">Level {offer.profiles.level}</span>
                      </div>
                      
                      {offer.price && (
                        <span className="font-medium">{offer.price} coins</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Offer Details */}
      {selectedOffer && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">{selectedOffer.skills.name}</h3>
                <p className="text-muted-foreground mb-4">{selectedOffer.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant={selectedOffer.offer_type === 'teach' ? 'default' : 'secondary'}>
                      {selectedOffer.offer_type === 'teach' ? 'Teaching' : 'Learning'}
                    </Badge>
                  </div>
                  
                  {selectedOffer.price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{selectedOffer.price} coins</span>
                    </div>
                  )}
                  
                  {selectedOffer.distance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance:</span>
                      <span>{formatDistance(selectedOffer.distance)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">About {selectedOffer.profiles.full_name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{selectedOffer.profiles.rating} rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level {selectedOffer.profiles.level}</Badge>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  Contact {selectedOffer.profiles.full_name}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
