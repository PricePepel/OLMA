import { filterContent, filterContentWithAI, checkContentCreationRateLimit } from '../safety'

describe('Safety Utilities', () => {
  describe('filterContent', () => {
    it('should pass clean content', () => {
      const cleanContent = 'This is a normal, clean message about learning JavaScript.'
      const result = filterContent(cleanContent)
      expect(result.isClean).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('should detect profanity', () => {
      const profaneContent = 'This message contains bad words like damn and hell.'
      const result = filterContent(profaneContent)
      expect(result.isClean).toBe(false)
      expect(result.violations).toContain('profanity')
    })

    it('should detect PII patterns', () => {
      const piiContent = 'My email is test@example.com and phone is 555-123-4567'
      const result = filterContent(piiContent)
      expect(result.isClean).toBe(false)
      expect(result.violations).toContain('pii')
    })

    it('should detect spam patterns', () => {
      const spamContent = 'BUY NOW!!! LIMITED TIME OFFER!!! CLICK HERE!!!'
      const result = filterContent(spamContent)
      expect(result.isClean).toBe(false)
      expect(result.violations).toContain('spam')
    })

    it('should detect excessive repetition', () => {
      const repetitiveContent = 'Hello hello hello hello hello hello hello hello hello hello'
      const result = filterContent(repetitiveContent)
      expect(result.isClean).toBe(false)
      expect(result.violations).toContain('repetition')
    })

    it('should detect excessive capitalization', () => {
      const capsContent = 'THIS IS ALL CAPS AND SHOULD BE FLAGGED'
      const result = filterContent(capsContent)
      expect(result.isClean).toBe(false)
      expect(result.violations).toContain('capitalization')
    })

    it('should handle multiple violations', () => {
      const badContent = 'BUY NOW!!! My email is spam@example.com and this is DAMN bad!'
      const result = filterContent(badContent)
      expect(result.isClean).toBe(false)
      expect(result.violations.length).toBeGreaterThan(1)
    })

    it('should handle empty content', () => {
      const result = filterContent('')
      expect(result.isClean).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000)
      const result = filterContent(longContent)
      expect(result.isClean).toBe(true) // Should not flag just for length
    })
  })

  describe('filterContentWithAI', () => {
    it('should use basic filtering when OpenAI is disabled', async () => {
      const content = 'This is clean content'
      const result = await filterContentWithAI(content)
      expect(result.isClean).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('should handle profanity with AI disabled', async () => {
      const content = 'This contains damn profanity'
      const result = await filterContentWithAI(content)
      expect(result.isClean).toBe(false)
      expect(result.violations).toContain('profanity')
    })
  })

  describe('checkContentCreationRateLimit', () => {
    beforeEach(() => {
      // Clear the rate limit cache before each test
      const rateLimitCache = new Map()
      ;(checkContentCreationRateLimit as any).rateLimitCache = rateLimitCache
    })

    it('should allow first post within rate limit', () => {
      const userId = 'user123'
      const result = checkContentCreationRateLimit(userId)
      expect(result.allowed).toBe(true)
      expect(result.remainingTime).toBe(0)
    })

    it('should block rapid posting', () => {
      const userId = 'user123'
      
      // First post should be allowed
      const firstResult = checkContentCreationRateLimit(userId)
      expect(firstResult.allowed).toBe(true)
      
      // Second post immediately after should be blocked
      const secondResult = checkContentCreationRateLimit(userId)
      expect(secondResult.allowed).toBe(false)
      expect(secondResult.remainingTime).toBeGreaterThan(0)
    })

    it('should allow posting after rate limit expires', () => {
      const userId = 'user123'
      
      // First post
      checkContentCreationRateLimit(userId)
      
      // Mock time passing (advance by 2 minutes)
      const originalDate = Date.now
      Date.now = jest.fn(() => originalDate() + 120000)
      
      // Second post after time has passed
      const result = checkContentCreationRateLimit(userId)
      expect(result.allowed).toBe(true)
      
      // Restore original Date.now
      Date.now = originalDate
    })

    it('should handle different users independently', () => {
      const user1 = 'user1'
      const user2 = 'user2'
      
      // User 1 posts
      const result1 = checkContentCreationRateLimit(user1)
      expect(result1.allowed).toBe(true)
      
      // User 2 should still be able to post
      const result2 = checkContentCreationRateLimit(user2)
      expect(result2.allowed).toBe(true)
    })
  })
})













