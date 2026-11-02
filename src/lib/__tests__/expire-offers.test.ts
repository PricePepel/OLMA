/**
 * @jest-environment node
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { expireOutdatedOffers, isAuthorizedCronRequest } from '../expire-offers'

function cronRequest(authorization?: string) {
  const headers = authorization ? { authorization } : undefined
  return new Request('http://localhost/api/offers/expire', { headers })
}

function fakeSupabase(result: { data: { id: string }[] | null; error: unknown }) {
  const query = {
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue(result),
  }
  const supabase = { from: jest.fn(() => query) }

  return { supabase: supabase as unknown as SupabaseClient, from: supabase.from, query }
}

describe('isAuthorizedCronRequest', () => {
  const originalSecret = process.env.CRON_SECRET

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = originalSecret
    }
  })

  it('accepts the bearer token Vercel sends', () => {
    process.env.CRON_SECRET = 'cron-secret-value'
    expect(isAuthorizedCronRequest(cronRequest('Bearer cron-secret-value'))).toBe(true)
  })

  it('rejects a request without an authorization header', () => {
    process.env.CRON_SECRET = 'cron-secret-value'
    expect(isAuthorizedCronRequest(cronRequest())).toBe(false)
  })

  it('rejects a wrong token', () => {
    process.env.CRON_SECRET = 'cron-secret-value'
    expect(isAuthorizedCronRequest(cronRequest('Bearer something-else'))).toBe(false)
  })

  it('rejects the secret without the Bearer prefix', () => {
    process.env.CRON_SECRET = 'cron-secret-value'
    expect(isAuthorizedCronRequest(cronRequest('cron-secret-value'))).toBe(false)
  })

  it('rejects every request while CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET
    expect(isAuthorizedCronRequest(cronRequest('Bearer undefined'))).toBe(false)
    expect(isAuthorizedCronRequest(cronRequest('Bearer '))).toBe(false)
  })

  it('rejects every request while CRON_SECRET is empty', () => {
    process.env.CRON_SECRET = ''
    expect(isAuthorizedCronRequest(cronRequest('Bearer '))).toBe(false)
  })
})

describe('expireOutdatedOffers', () => {
  const now = new Date('2026-11-02T00:00:00.000Z')

  it('turns down pending invitations whose meeting date has passed', async () => {
    const { supabase, from, query } = fakeSupabase({ data: [{ id: 'a' }, { id: 'b' }], error: null })

    await expect(expireOutdatedOffers(supabase, now)).resolves.toEqual(['a', 'b'])

    expect(from).toHaveBeenCalledWith('meeting_invitations')
    expect(query.update).toHaveBeenCalledWith({
      status: 'denied',
      updated_at: '2026-11-02T00:00:00.000Z'
    })
    expect(query.eq).toHaveBeenCalledWith('status', 'pending')
    expect(query.lt).toHaveBeenCalledWith('meeting_date', '2026-11-02T00:00:00.000Z')
    expect(query.select).toHaveBeenCalledWith('id')
  })

  it('returns no ids when nothing has expired', async () => {
    const { supabase } = fakeSupabase({ data: [], error: null })

    await expect(expireOutdatedOffers(supabase, now)).resolves.toEqual([])
  })

  it('treats a null result as nothing expired', async () => {
    const { supabase } = fakeSupabase({ data: null, error: null })

    await expect(expireOutdatedOffers(supabase, now)).resolves.toEqual([])
  })

  it('throws the database error instead of reporting success', async () => {
    const dbError = { code: '42501', message: 'permission denied' }
    const { supabase } = fakeSupabase({ data: null, error: dbError })

    await expect(expireOutdatedOffers(supabase, now)).rejects.toBe(dbError)
  })
})
