/**
 * @jest-environment node
 */
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '../admin'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}))

describe('createAdminClient', () => {
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  afterEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
    jest.clearAllMocks()
  })

  it('uses the service role key without a stored session', () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

    createAdminClient()

    expect(createClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      'service-role-key',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  })

  it('refuses to fall back to the anon key when the service role key is missing', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() => createAdminClient()).toThrow('Missing Supabase service role environment variables')
    expect(createClient).not.toHaveBeenCalled()
  })
})
