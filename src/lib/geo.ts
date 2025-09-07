// Enhanced Geo Utilities for OLMA MVP
import { Database } from '@/lib/types'

type Location = Database['public']['Tables']['locations']['Row']

// Haversine formula for calculating distance between two points
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Round coordinates to ~0.01° (approximately 1km precision)
export function roundCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100
  }
}

// Calculate bounding box for efficient geo queries
export function calculateBoundingBox(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
} {
  const latDelta = radiusKm / 111.32 // 1 degree latitude ≈ 111.32 km
  const lngDelta = radiusKm / (111.32 * Math.cos(centerLat * (Math.PI / 180)))

  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLng: centerLng - lngDelta,
    maxLng: centerLng + lngDelta
  }
}

// Parse location string (e.g., "37.7749,-122.4194")
export function parseLocationString(locationStr: string): { lat: number; lng: number } | null {
  try {
    const [lat, lng] = locationStr.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return null
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    return { lat, lng }
  } catch {
    return null
  }
}

// Format location for display
export function formatLocation(location: Location): string {
  if (!location.address_text) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
  }
  return location.address_text
}

// Check if location is within radius
export function isLocationWithinRadius(
  centerLat: number,
  centerLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLng, targetLat, targetLng)
  return distance <= radiusKm
}

// Get user's current location (browser geolocation)
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        resolve({ lat: latitude, lng: longitude })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: false, // Use lower accuracy for privacy
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    )
  })
}

// Calculate distance between two locations
export function calculateLocationDistance(loc1: Location, loc2: Location): number {
  return calculateDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng)
}

// Sort locations by distance from a center point
export function sortLocationsByDistance<T extends { lat: number; lng: number }>(
  locations: T[],
  centerLat: number,
  centerLng: number
): T[] {
  return locations.sort((a, b) => {
    const distanceA = calculateDistance(centerLat, centerLng, a.lat, a.lng)
    const distanceB = calculateDistance(centerLat, centerLng, b.lat, b.lng)
    return distanceA - distanceB
  })
}

// Validate coordinates
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Get privacy level for location sharing
export function getLocationPrivacyLevel(userPreference: string, context: 'offer' | 'event' | 'profile'): 'public' | 'club' | 'private' {
  switch (userPreference) {
    case 'always_public':
      return 'public'
    case 'club_only':
      return 'club'
    case 'never':
      return 'private'
    case 'contextual':
      // Contextual privacy based on use case
      switch (context) {
        case 'offer':
          return 'public' // Offers need to be discoverable
        case 'event':
          return 'club' // Events are typically club-based
        case 'profile':
          return 'private' // Profile location is private by default
        default:
          return 'private'
      }
    default:
      return 'private'
  }
}
