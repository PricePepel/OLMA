# OLMA Geo & Meetings System

This document provides comprehensive documentation for the Geo & Meetings functionality implemented in the OLMA MVP, including location management, geo-based search, map integration, and privacy controls.

## Overview

The Geo & Meetings system enables users to:
- Share their approximate location with privacy controls
- Discover skill offers and events near them
- View meeting points on maps
- Coordinate in-person meetups for skill exchange

## Features

### 1. Location Management (`LocationManager`)

**Component**: `src/components/location/location-manager.tsx`

Users can manage their location settings with privacy controls:

- **Location Sharing Toggle**: Enable/disable location sharing
- **Automatic Detection**: Use browser geolocation with privacy rounding
- **Manual Input**: Enter coordinates manually
- **Privacy Controls**: Choose from multiple privacy levels
- **Map Preview**: Visual preview of location with privacy indicators

**Privacy Levels**:
- `private`: Only visible to the user
- `club`: Visible to club members only
- `public`: Visible to all users

**Coordinate Rounding**: Locations are automatically rounded to ~0.01° (~1km precision) for privacy.

### 2. Map Integration (`MapStub`)

**Component**: `src/components/ui/map-stub.tsx`

Abstracted map component with API key gates and fallback support:

- **Provider Support**: Google Maps, Mapbox, OpenStreetMap
- **API Key Gates**: Graceful fallback when API keys are missing
- **Static Preview**: Shows location data when maps are unavailable
- **Interactive Features**: Click to set location, view markers
- **Privacy Indicators**: Visual cues for private locations

**Features**:
- Location markers with titles and descriptions
- Privacy level indicators (eye/eye-off icons)
- Map controls (zoom in/out)
- Click-to-set-location functionality
- Responsive design

### 3. Geo-Based Offer Search (`OffersMapView`)

**Component**: `src/components/offers/offers-map-view.tsx`

Enhanced offers discovery with map integration:

- **Map View**: Visual representation of nearby offers
- **Distance Filtering**: Search within specified radius
- **Location Detection**: Automatic current location detection
- **Offer Details**: Click markers to view offer details
- **Dual View**: Toggle between list and map views

**Search Filters**:
- Skill type
- Offer type (teach/learn)
- Search radius (5km, 10km, 25km, 50km)
- Location coordinates

### 4. Enhanced Geo Utilities (`geo.ts`)

**File**: `src/lib/geo.ts`

Comprehensive geolocation utilities:

- **Haversine Distance**: Accurate distance calculation between coordinates
- **Coordinate Rounding**: Privacy-preserving location rounding
- **Bounding Box**: Efficient geo queries with bounding box calculations
- **Location Validation**: Coordinate validation and parsing
- **Privacy Controls**: Context-aware privacy level determination

**Key Functions**:
```typescript
calculateDistance(lat1, lng1, lat2, lng2): number
roundCoordinates(lat, lng): { lat, lng }
calculateBoundingBox(centerLat, centerLng, radiusKm): BoundingBox
getCurrentLocation(): Promise<{ lat, lng }>
validateCoordinates(lat, lng): boolean
getLocationPrivacyLevel(preference, context): PrivacyLevel
```

## API Endpoints

### 1. Location Management (`/api/locations`)

**GET** `/api/locations`
- Fetch locations with privacy filtering
- Query params: `user_id`, `privacy_level`
- Returns: Array of locations respecting privacy settings

**POST** `/api/locations`
- Create or update user location
- Body: `{ user_id, latitude, longitude, address_text?, privacy_level }`
- Automatically rounds coordinates for privacy
- Returns: Created/updated location

**PATCH** `/api/locations`
- Update existing location
- Body: `{ latitude?, longitude?, address_text?, privacy_level? }`
- Returns: Updated location

**DELETE** `/api/locations`
- Delete user's location
- Returns: Success message

### 2. Enhanced Offers Search (`/api/offers`)

**GET** `/api/offers?near=lat,lng&radiusKm=10`
- Geo-based offer search
- Query params: `near` (coordinates), `radiusKm` (search radius)
- Uses bounding box optimization for efficient queries
- Returns: Offers with distance calculations

## Database Schema

### Locations Table

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address_text TEXT,
  privacy_level privacy_level NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient geo queries
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_privacy ON locations(privacy_level);
CREATE INDEX idx_locations_geo ON locations USING btree(latitude, longitude);
```

### RLS Policies

```sql
-- Users can see their own location or public locations
CREATE POLICY "Users can view own or public locations" ON locations
  FOR SELECT USING (
    auth.uid() = user_id OR privacy_level = 'public'
  );

-- Users can only manage their own location
CREATE POLICY "Users can manage own location" ON locations
  FOR ALL USING (auth.uid() = user_id);
```

## Privacy & Security

### 1. Coordinate Rounding

All user locations are automatically rounded to ~0.01° precision (~1km), providing privacy while maintaining usefulness for local discovery.

### 2. Privacy Levels

- **Private**: Only visible to the user
- **Club**: Visible to club members only
- **Public**: Visible to all users (for offers/events)

### 3. Context-Aware Privacy

Privacy levels are determined based on context:
- **Profile**: Private by default
- **Offers**: Public (for discoverability)
- **Events**: Club (for club-based events)

### 4. API Key Management

Map providers require API keys, but the system gracefully degrades:
- Shows static preview when keys are missing
- Displays location data in text format
- Maintains functionality without external dependencies

## Usage Examples

### 1. Setting User Location

```typescript
import { LocationManager } from '@/components/location/location-manager'

<LocationManager 
  userId={user.id}
  initialLocation={userLocation}
  onLocationUpdate={(location) => console.log('Location updated:', location)}
/>
```

### 2. Displaying Map

```typescript
import { MapStub } from '@/components/ui/map-stub'

<MapStub
  locations={[
    { lat: 37.7749, lng: -122.4194, title: 'Meeting Point', privacy: 'public' }
  ]}
  center={{ lat: 37.7749, lng: -122.4194 }}
  onLocationClick={(location) => console.log('Clicked:', location)}
  onMapClick={(lat, lng) => console.log('Map clicked:', lat, lng)}
/>
```

### 3. Geo-Based Offer Search

```typescript
import { OffersMapView } from '@/components/offers/offers-map-view'

<OffersMapView 
  onOfferClick={(offer) => console.log('Offer selected:', offer)}
/>
```

## Configuration

### Environment Variables

```bash
# Map Provider API Keys (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Default Map Provider
NEXT_PUBLIC_DEFAULT_MAP_PROVIDER=google
```

### Map Provider Setup

1. **Google Maps**:
   - Enable Maps JavaScript API
   - Set up billing
   - Add API key to environment

2. **Mapbox**:
   - Create Mapbox account
   - Generate access token
   - Add token to environment

3. **OpenStreetMap**:
   - No API key required
   - Free to use
   - Limited features

## Performance Considerations

### 1. Bounding Box Optimization

Geo queries use bounding box calculations to reduce database load:
- Pre-filters locations within approximate area
- Reduces distance calculations
- Improves query performance

### 2. Indexing Strategy

- B-tree index on `(latitude, longitude)` for bounding box queries
- Separate indexes for `user_id` and `privacy_level`
- Composite indexes for common query patterns

### 3. Caching

- Browser geolocation cached for 5 minutes
- Map tiles cached by provider
- API responses cached where appropriate

## Error Handling

### 1. Geolocation Errors

- Graceful fallback when geolocation is unavailable
- User-friendly error messages
- Manual coordinate input as alternative

### 2. Map Provider Errors

- Static preview when API keys are missing
- Fallback to text-based location display
- Error boundaries for map component failures

### 3. API Errors

- Rate limiting for location updates
- Validation errors for invalid coordinates
- Privacy violation handling

## Future Enhancements

### 1. Advanced Features

- **Real-time Location**: Live location updates for active meetups
- **Route Planning**: Directions to meeting points
- **Location History**: Track location changes over time
- **Geofencing**: Notifications when entering areas with offers

### 2. Privacy Improvements

- **Differential Privacy**: Add noise to location data
- **Time-based Privacy**: Auto-expire location data
- **Granular Controls**: Per-offer privacy settings

### 3. Map Enhancements

- **Custom Markers**: Skill-specific map markers
- **Clustering**: Group nearby offers
- **Heat Maps**: Show offer density
- **3D Views**: Enhanced map visualization

## Testing

### 1. Unit Tests

```typescript
// Test coordinate rounding
expect(roundCoordinates(37.7749, -122.4194)).toEqual({
  lat: 37.77,
  lng: -122.42
});

// Test distance calculation
expect(calculateDistance(37.7749, -122.4194, 37.7849, -122.4094))
  .toBeCloseTo(1.4, 1);
```

### 2. Integration Tests

- Test location API endpoints
- Verify privacy controls
- Test map component rendering
- Validate geo-based search

### 3. E2E Tests

- Complete location setup flow
- Test offer discovery with location
- Verify map interactions
- Test privacy settings

## Security Considerations

### 1. Data Protection

- All coordinates rounded for privacy
- Privacy levels enforced at API level
- RLS policies prevent unauthorized access
- No precise location storage

### 2. API Security

- Rate limiting on location updates
- Input validation for coordinates
- Authentication required for all operations
- CORS configuration for map providers

### 3. Privacy Compliance

- GDPR-compliant location handling
- User consent for location sharing
- Data retention policies
- Right to deletion support

## Troubleshooting

### Common Issues

1. **Map Not Loading**:
   - Check API key configuration
   - Verify provider settings
   - Check network connectivity

2. **Location Detection Fails**:
   - Ensure HTTPS for geolocation
   - Check browser permissions
   - Verify location services enabled

3. **Offers Not Found**:
   - Check location privacy settings
   - Verify search radius
   - Ensure offers have geo_opt_in enabled

### Debug Mode

Enable debug logging for geo operations:

```typescript
// In development
console.log('Location data:', locationData);
console.log('Distance calculation:', distance);
console.log('Bounding box:', bbox);
```

## Conclusion

The Geo & Meetings system provides a comprehensive solution for location-based skill discovery while maintaining user privacy and system performance. The modular design allows for easy extension and customization based on specific requirements.
