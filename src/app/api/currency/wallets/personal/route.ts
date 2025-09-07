import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse, createSuccessResponse, getAuthenticatedUser, errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    // Get user's personal wallet
    const { data: wallet, error } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('profile_id', user.id)
      .eq('type', 'personal')
      .single()

    if (error) {
      // If wallet doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('currency_wallets')
          .insert({
            profile_id: user.id,
            type: 'personal',
            balance: 0
          })
          .select()
          .single()

        if (createError) {
          return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, createError.message)
        }

        return createSuccessResponse(newWallet)
      }

      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, error.message)
    }

    return createSuccessResponse(wallet)

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


