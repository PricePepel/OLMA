import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  validateRequest,
  buildSearchQuery,
  buildCursorPagination,
  handleCursorPagination,
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams
    const queryParams = {
      cursor: params.get('cursor') || undefined,
      q: params.get('q') || undefined,
      type: params.get('type') || 'all',
      limit: parseInt(params.get('limit') || '20'),
      near: params.get('near') || undefined,
      radiusKm: parseInt(params.get('radiusKm') || '50'),
    }

    const supabase = await createClient()
    
    // Build base query with joins
    let query = supabase
      .from('skill_offers')
      .select(`
        *,
        profiles!skill_offers_profile_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          rating
        )
      `)

    // Apply search filters
    if (queryParams.q) {
      query = buildSearchQuery(query, queryParams.q)
    }

    // Apply type filter
    if (queryParams.type !== 'all') {
      query = query.eq('offer_type', queryParams.type)
    }

    // Apply location filter if provided
    if (queryParams.near) {
      const [lat, lng] = queryParams.near.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        // Calculate bounding box for efficient querying
        const radiusDegrees = queryParams.radiusKm / 111 // Approximate degrees per km
        const latMin = lat - radiusDegrees
        const latMax = lat + radiusDegrees
        const lngMin = lng - radiusDegrees / Math.cos(lat * Math.PI / 180)
        const lngMax = lng + radiusDegrees / Math.cos(lat * Math.PI / 180)
        
        query = query
          .gte('latitude', latMin)
          .lte('latitude', latMax)
          .gte('longitude', lngMin)
          .lte('longitude', lngMax)
      }
    }

    // Apply cursor pagination
    query = buildCursorPagination(
      query,
      queryParams.cursor,
      queryParams.limit,
      'created_at',
      'desc'
    )

    const { data: offers, error } = await query

    if (error) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    // Handle pagination
    const { data: items, hasMore, cursor } = handleCursorPagination(offers, queryParams.limit)

    // If location filter was applied, calculate exact distances
    let processedOffers = items
    if (queryParams.near) {
      const [lat, lng] = queryParams.near.split(',').map(Number)
      processedOffers = items.map(offer => {
        const distance = calculateDistance(lat, lng, offer.latitude, offer.longitude)
        return { ...offer, distance }
      }).filter(offer => offer.distance <= queryParams.radiusKm)
        .sort((a, b) => a.distance - b.distance)
    }

    return createSuccessResponse({
      data: processedOffers,
      total: processedOffers.length,
      page: 1,
      limit: queryParams.limit,
      hasMore,
      cursor
    })

  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()

    // Validate required fields
    if (!body.skill_name || !body.description) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Skill name and description are required')
    }

    // Create skill offer
    const { data: offer, error: offerError } = await supabase
      .from('skill_offers')
      .insert({
        profile_id: user.id,
        skill_name: body.skill_name,
        offer_type: body.offer_type || 'teach',
        description: body.description,
        location: body.location || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
      })
      .select(`
        *,
        profiles!skill_offers_profile_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          rating
        )
      `)
      .single()

    if (offerError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, offerError.message)
    }

    // Award gamification rewards for creating a skill offer
    try {
      // This would be a skill offer creation reward
      // await rewardSkillOfferCreation(user.id, offer.id)
    } catch (rewardError) {
      console.error('Error awarding skill offer creation rewards:', rewardError)
      // Don't fail the offer creation if rewards fail
    }

    return createSuccessResponse(offer, 'Skill offer created successfully', 201)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return errorHandlers.unauthorized()
      }
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
