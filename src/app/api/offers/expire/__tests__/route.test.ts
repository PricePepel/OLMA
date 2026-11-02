/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { expireOutdatedOffers } from '@/lib/expire-offers'
import { GET } from '../route'

// api-helpers starts a rate-limit cleanup interval on import, which would keep
// the Jest worker alive. Load it under fake timers so that interval never runs.
jest.mock('@/lib/api-helpers', () => {
  jest.useFakeTimers()
  const actual = jest.requireActual('@/lib/api-helpers')
  jest.useRealTimers()
  return actual
})

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({ from: jest.fn() })),
}))

jest.mock('@/lib/expire-offers', () => ({
  ...jest.requireActual('@/lib/expire-offers'),
  expireOutdatedOffers: jest.fn(),
}))

const mockExpire = expireOutdatedOffers as jest.MockedFunction<typeof expireOutdatedOffers>
const mockAdmin = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function cronRequest(authorization?: string) {
  const headers = authorization ? { authorization } : undefined
  return new NextRequest('http://localhost/api/offers/expire', { headers })
}

describe('GET /api/offers/expire', () => {
  const originalSecret = process.env.CRON_SECRET

  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret-value'
    jest.clearAllMocks()
  })

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = originalSecret
    }
  })

  it('returns 401 and touches nothing without the cron secret', async () => {
    const response = await GET(cronRequest())

    expect(response.status).toBe(401)
    expect(mockAdmin).not.toHaveBeenCalled()
    expect(mockExpire).not.toHaveBeenCalled()
  })

  it('returns 401 for a wrong token', async () => {
    const response = await GET(cronRequest('Bearer wrong'))

    expect(response.status).toBe(401)
    expect(mockExpire).not.toHaveBeenCalled()
  })

  it('returns 401 while CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET

    const response = await GET(cronRequest('Bearer undefined'))

    expect(response.status).toBe(401)
    expect(mockExpire).not.toHaveBeenCalled()
  })

  it('expires offers with the service role client, not a user session', async () => {
    const adminClient = { from: jest.fn() }
    mockAdmin.mockReturnValueOnce(adminClient as never)
    mockExpire.mockResolvedValueOnce(['a', 'b'])

    const response = await GET(cronRequest('Bearer cron-secret-value'))

    expect(response.status).toBe(200)
    expect(mockExpire).toHaveBeenCalledWith(adminClient)
    expect(createClient).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Expired 2 offers',
      data: { expiredCount: 2, expiredIds: ['a', 'b'] },
    })
  })

  it('returns 200 with a zero count when nothing has expired', async () => {
    mockExpire.mockResolvedValueOnce([])

    const response = await GET(cronRequest('Bearer cron-secret-value'))

    expect(response.status).toBe(200)
    expect((await response.json()).data).toEqual({ expiredCount: 0, expiredIds: [] })
  })

  it('returns 500 when the database update fails', async () => {
    mockExpire.mockRejectedValueOnce({ code: '42501', message: 'permission denied' })

    const response = await GET(cronRequest('Bearer cron-secret-value'))

    expect(response.status).toBe(500)
    expect((await response.json()).success).toBe(false)
  })

  it('returns 500 when the service role key is missing', async () => {
    mockAdmin.mockImplementationOnce(() => {
      throw new Error('Missing Supabase service role environment variables')
    })

    const response = await GET(cronRequest('Bearer cron-secret-value'))

    expect(response.status).toBe(500)
    expect(mockExpire).not.toHaveBeenCalled()
  })
})
