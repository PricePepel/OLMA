import { test, expect } from '@playwright/test'

// Runs without a Supabase project, so CI can check it on every push.
test.describe('smoke', () => {
  test('the landing page loads', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveTitle(/OLMA/)
  })

  test('the sign-in page offers a form', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('security headers are set', async ({ request }) => {
    const response = await request.get('/')
    expect(response.headers()['x-frame-options']).toBe('DENY')
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
  })

  for (const path of [
    '/test-env',
    '/api/test-env',
    '/api/test-db',
    '/api/test-connection',
    '/api/test-find-teachers',
    '/api/test-meetings',
    '/api/test-teachers',
  ]) {
    test(`debug route ${path} is gone`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404)
    })
  }
})
