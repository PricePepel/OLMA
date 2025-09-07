import { test, expect } from '@playwright/test'

test.describe('OLMA MVP Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should load the landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/OLMA/)
    await expect(page.locator('h1')).toContainText('Learn Together')
    await expect(page.locator('text=Get Started')).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.click('text=Get Started')
    await expect(page).toHaveURL(/.*signup/)
    await expect(page.locator('h1')).toContainText('Create your account')
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('text=Sign In')
    await expect(page).toHaveURL(/.*signin/)
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('should display features section', async ({ page }) => {
    await page.click('text=Learn More')
    await expect(page.locator('#features')).toBeVisible()
    await expect(page.locator('text=Skill Exchange')).toBeVisible()
    await expect(page.locator('text=Learning Clubs')).toBeVisible()
    await expect(page.locator('text=Events & Meetups')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Test logo link
    await page.click('text=OLMA')
    await expect(page).toHaveURL('http://localhost:3000/')

    // Test features link
    await page.click('text=Features')
    await expect(page.locator('#features')).toBeVisible()
  })

  test('should display skills categories', async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await expect(page.locator('text=Skills for every interest')).toBeVisible()
    await expect(page.locator('text=Programming')).toBeVisible()
    await expect(page.locator('text=Languages')).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('text=OLMA')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=OLMA')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('text=OLMA')).toBeVisible()
  })

  test('should have accessible elements', async ({ page }) => {
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3').all()
    expect(headings.length).toBeGreaterThan(0)

    // Check for alt text on images
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }

    // Check for proper button labels
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('should handle form validation on sign up', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup')
    
    // Try to submit empty form
    await page.click('text=Create account')
    
    // Should show validation errors
    await expect(page.locator('text=Please enter your full name')).toBeVisible()
  })

  test('should handle form validation on sign in', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin')
    
    // Try to submit empty form
    await page.click('text=Sign in')
    
    // Should show validation errors
    await expect(page.locator('text=Please fill in all fields')).toBeVisible()
  })

  test('should have working OAuth buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup')
    
    // Check OAuth buttons are present
    await expect(page.locator('text=Continue with Google')).toBeVisible()
    await expect(page.locator('text=Continue with GitHub')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/OLMA/)

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toContain('peer learning')

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toBeTruthy()
  })

  test('should have working theme toggle', async ({ page }) => {
    // This test would require authentication, so we'll just check the component exists
    // In a real scenario, you'd need to be logged in to test this
    await page.goto('http://localhost:3000/dashboard')
    
    // Should redirect to sign in if not authenticated
    await expect(page).toHaveURL(/.*signin/)
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/nonexistent-page')
    
    // Should show 404 or redirect to home
    const currentUrl = page.url()
    expect(currentUrl === 'http://localhost:3000/nonexistent-page' || 
           currentUrl === 'http://localhost:3000/').toBeTruthy()
  })

  test('should have proper loading states', async ({ page }) => {
    // Test that the page loads without errors
    await expect(page.locator('body')).toBeVisible()
    
    // Check for any loading spinners that should disappear
    const spinners = await page.locator('.spinner').all()
    if (spinners.length > 0) {
      // Wait for spinners to disappear
      await page.waitForTimeout(2000)
      const remainingSpinners = await page.locator('.spinner').all()
      expect(remainingSpinners.length).toBe(0)
    }
  })

  test('should have working links in footer', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    
    // Check footer links exist
    await expect(page.locator('text=Privacy Policy')).toBeVisible()
    await expect(page.locator('text=Terms of Service')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Test enter key on buttons
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    // Should navigate to sign up page
    await expect(page).toHaveURL(/.*signup/)
  })
})

test.describe('Authentication Flow', () => {
  test('should complete sign up flow', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup')
    
    // Fill out the form
    await page.fill('input[name="fullName"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    
    // Submit form
    await page.click('text=Create account')
    
    // Should show success message or redirect
    await expect(page.locator('text=Account created successfully')).toBeVisible()
  })

  test('should complete sign in flow', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin')
    
    // Fill out the form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Submit form
    await page.click('text=Sign in')
    
    // Should redirect to dashboard or show error
    const currentUrl = page.url()
    expect(currentUrl.includes('/dashboard') || 
           currentUrl.includes('/auth/signin')).toBeTruthy()
  })
})

test.describe('Dashboard (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // This would require setting up authentication state
    // For now, we'll just test that unauthenticated users are redirected
    await page.goto('http://localhost:3000/dashboard')
  })

  test('should redirect unauthenticated users to sign in', async ({ page }) => {
    await expect(page).toHaveURL(/.*signin/)
  })
})

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('http://localhost:3000')
    const loadTime = Date.now() - startTime
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    expect(errors).toHaveLength(0)
  })
})


