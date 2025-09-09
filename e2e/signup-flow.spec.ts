import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test('should complete full user journey: signup → profile → post → DM → purchase', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/auth/signup')
    
    // Fill signup form
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'TestPassword123!')
    await page.fill('[name="fullName"]', 'Test User')
    await page.fill('[name="username"]', `testuser${Date.now()}`)
    
    // Submit signup form
    await page.click('button[type="submit"]')
    
    // Should redirect to profile setup
    await expect(page).toHaveURL(/\/auth\/profile/)
    
    // Fill profile setup form
    await page.fill('[name="bio"]', 'I am a test user learning new skills')
    await page.fill('[name="location"]', 'New York, NY')
    
    // Submit profile form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Navigate to feed and create a post
    await page.click('a[href="/feed"]')
    await page.fill('[data-testid="post-content"]', 'Hello OLMA! This is my first post.')
    await page.click('[data-testid="submit-post"]')
    
    // Verify post was created
    await expect(page.locator('text=Hello OLMA! This is my first post.')).toBeVisible()
    
    // Navigate to skills and create a skill offer
    await page.click('a[href="/skills"]')
    await page.click('[data-testid="create-skill-offer"]')
    await page.fill('[name="skillName"]', 'JavaScript')
    await page.selectOption('[name="offerType"]', 'teach')
    await page.fill('[name="description"]', 'I can teach JavaScript basics')
    await page.click('button[type="submit"]')
    
    // Verify skill offer was created
    await expect(page.locator('text=JavaScript')).toBeVisible()
    
    // Navigate to shop and make a purchase
    await page.click('a[href="/shop"]')
    await page.click('[data-testid="purchase-item"]')
    
    // Verify purchase was successful
    await expect(page.locator('text=Purchase successful')).toBeVisible()
    
    // Navigate to achievements
    await page.click('a[href="/achievements"]')
    
    // Verify user has earned some achievements
    await expect(page.locator('[data-testid="achievement"]')).toBeVisible()
  })

  test('should handle signup validation errors', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should handle duplicate username', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // Fill form with existing username
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'TestPassword123!')
    await page.fill('[name="fullName"]', 'Test User')
    await page.fill('[name="username"]', 'existinguser')
    
    await page.click('button[type="submit"]')
    
    // Should show error for duplicate username
    await expect(page.locator('text=Username already exists')).toBeVisible()
  })
})

















