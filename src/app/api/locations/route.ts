import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse, getAuthenticatedUser, validateRequest, checkRateLimit, errorHandlers } from '@/lib/api-helpers'
import { createLocationSchema } from '@/types/api'
import { ApiErrorCode } from '@/types/api'
import { validateCoordinates, roundCoordinates } from '@/lib/geo'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Users can only view their own location or public locations
    if (userId && userId !== user.id) {
      return createErrorResponse(
        ApiErrorCode.FORBIDDEN,
        'You can only view your own location'
      )
    }
    
    const targetUserId = userId || user.id
    
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', targetUserId)
      .single()
    
    if (error) {
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        `Failed to fetch locations: ${error.message}`
      )
    }
    
    return createSuccessResponse(data)
  } catch (error) {
    return errorHandlers.internalError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequest(createLocationSchema, body) as any
    const { user, supabase } = await getAuthenticatedUser()
    
    // Users can only create/update their own location
    if (validatedData.user_id !== user.id) {
      return createErrorResponse(
        ApiErrorCode.FORBIDDEN,
        'You can only manage your own location'
      )
    }
    
    if (!checkRateLimit(user.id, 'update_location', 10, 60000)) {
      return errorHandlers.rateLimited()
    }
    
    // Validate coordinates
    if (!validateCoordinates(validatedData.latitude, validatedData.longitude)) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid coordinates provided'
      )
    }
    
    // Round coordinates for privacy (if not already rounded)
    const rounded = roundCoordinates(validatedData.latitude, validatedData.longitude)
    
    // Check if location already exists for this user
    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    let result
    if (existingLocation) {
      // Update existing location
      const { data, error } = await supabase
        .from('locations')
        .update({
          latitude: rounded.lat,
          longitude: rounded.lng,
          address_text: validatedData.address_text,
          privacy_level: validatedData.privacy_level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) {
        return createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          `Failed to update location: ${error.message}`
        )
      }
      
      result = data
    } else {
      // Create new location
      const { data, error } = await supabase
        .from('locations')
        .insert({
          user_id: user.id,
          latitude: rounded.lat,
          longitude: rounded.lng,
          address_text: validatedData.address_text,
          privacy_level: validatedData.privacy_level
        })
        .select()
        .single()
      
      if (error) {
        return createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          `Failed to create location: ${error.message}`
        )
      }
      
      result = data
    }
    
    return createSuccessResponse(result)
  } catch (error) {
    return errorHandlers.internalError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, supabase } = await getAuthenticatedUser()
    
    // Users can only update their own location
    if (body.user_id && body.user_id !== user.id) {
      return createErrorResponse(
        ApiErrorCode.FORBIDDEN,
        'You can only update your own location'
      )
    }
    
    if (!checkRateLimit(user.id, 'update_location', 10, 60000)) {
      return errorHandlers.rateLimited()
    }
    
    // Validate coordinates if provided
    if (body.latitude && body.longitude) {
      if (!validateCoordinates(body.latitude, body.longitude)) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Invalid coordinates provided'
        )
      }
      
      // Round coordinates for privacy
      const rounded = roundCoordinates(body.latitude, body.longitude)
      body.latitude = rounded.lat
      body.longitude = rounded.lng
    }
    
    // Update location
    const { data, error } = await supabase
      .from('locations')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        `Failed to update location: ${error.message}`
      )
    }
    
    return createSuccessResponse(data)
  } catch (error) {
    return errorHandlers.internalError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()
    
    // Users can only delete their own location
    const { data, error } = await supabase
      .from('locations')
      .delete()
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        `Failed to delete location: ${error.message}`
      )
    }
    
    return createSuccessResponse({ success: true })
  } catch (error) {
    return errorHandlers.internalError(error)
  }
}
