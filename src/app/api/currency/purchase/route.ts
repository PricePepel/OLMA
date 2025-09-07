import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { purchaseItemSchema } from '@/types/api'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  validateRequest,
  checkRateLimit,
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequest(purchaseItemSchema, body) as any
    
    const { user, supabase } = await getAuthenticatedUser()

    // Check rate limit
    if (!checkRateLimit(user.id, 'purchase_item', 10, 60000)) { // 10 purchases per minute
      return errorHandlers.rateLimited()
    }

    // Get item details
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', validatedData.itemId)
      .single()

    if (itemError || !item) {
      return errorHandlers.notFound()
    }

    // Check if item is available
    if (!item.is_active) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'Item is not available for purchase')
    }

    // Get user's wallet for the item's currency type
    const { data: wallet, error: walletError } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('profile_id', user.id)
      .eq('currency_type', item.currency_type)
      .single()

    if (walletError || !wallet) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Wallet not found for this currency type')
    }

    const totalCost = item.price * validatedData.quantity

    // Check if user has sufficient funds
    if (wallet.balance < totalCost) {
      return createErrorResponse(ApiErrorCode.INSUFFICIENT_FUNDS, 'Insufficient funds')
    }

    // Perform atomic transaction
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        profile_id: user.id,
        item_id: validatedData.itemId,
        quantity: validatedData.quantity,
        total_price: totalCost,
        currency_type: item.currency_type,
        status: 'completed'
      })
      .select(`
        *,
        shop_items!purchases_item_id_fkey (
          id,
          name,
          description,
          price,
          currency_type,
          item_type
        )
      `)
      .single()

    if (purchaseError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, purchaseError.message)
    }

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('currency_wallets')
      .update({ balance: wallet.balance - totalCost })
      .eq('id', wallet.id)

    if (updateError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, updateError.message)
    }

    // Record transaction in ledger
    const { error: ledgerError } = await supabase
      .from('currency_ledger')
      .insert({
        wallet_id: wallet.id,
        delta: -totalCost,
        reason: `Purchase: ${item.name} x${validatedData.quantity}`,
        ref_table: 'purchases',
        ref_id: purchase.id
      })

    if (ledgerError) {
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, ledgerError.message)
    }

    // Get updated wallet with recent transactions
    const { data: updatedWallet } = await supabase
      .from('currency_wallets')
      .select(`
        *,
        currency_ledger!currency_ledger_wallet_id_fkey (
          id,
          delta,
          reason,
          created_at
        )
      `)
      .eq('id', wallet.id)
      .order('currency_ledger.created_at', { ascending: false })
      .limit(5)
      .single()

    const walletWithTransactions = {
      ...updatedWallet,
      recentTransactions: updatedWallet?.currency_ledger || []
    }

    return createSuccessResponse({
      purchase: {
        id: purchase.id,
        item: purchase.shop_items,
        quantity: purchase.quantity,
        total_price: purchase.total_price
      },
      updatedWallet: walletWithTransactions
    }, 'Purchase completed successfully')

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
