import { 
  formatDate, 
  formatTime, 
  formatRelativeTime, 
  truncateText, 
  capitalizeFirst,
  slugify,
  formatNumber,
  formatCurrency,
  isValidEmail,
  isValidUrl,
  calculateDistance,
  getInitials
} from '../utils'

describe('Utility Functions', () => {
  describe('Date formatting', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Jan 15, 2024/)
    })

    it('should format time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      const formatted = formatTime(date)
      expect(formatted).toMatch(/2:30/)
    })

    it('should format relative time correctly', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const formatted = formatRelativeTime(oneHourAgo)
      expect(formatted).toBe('1h ago')
    })
  })

  describe('String utilities', () => {
    it('should truncate text correctly', () => {
      const text = 'This is a long text that needs to be truncated'
      const truncated = truncateText(text, 20)
      expect(truncated).toBe('This is a long text...')
      expect(truncated.length).toBeLessThanOrEqual(23) // 20 + 3 for '...'
    })

    it('should not truncate short text', () => {
      const text = 'Short text'
      const truncated = truncateText(text, 20)
      expect(truncated).toBe(text)
    })

    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
      expect(capitalizeFirst('world')).toBe('World')
    })

    it('should create slug correctly', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('Test & More')).toBe('test-more')
    })
  })

  describe('Number formatting', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(1500000)).toBe('1.5M')
      expect(formatNumber(500)).toBe('500')
    })

    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(99.99)).toBe('$99.99')
    })
  })

  describe('Validation utilities', () => {
    it('should validate email correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should validate URL correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://test.org')).toBe(true)
      expect(isValidUrl('not-a-url')).toBe(false)
    })
  })

  describe('Distance calculation', () => {
    it('should calculate distance correctly', () => {
      // New York to Los Angeles approximate coordinates
      const nyLat = 40.7128
      const nyLng = -74.0060
      const laLat = 34.0522
      const laLng = -118.2437

      const distance = calculateDistance(nyLat, nyLng, laLat, laLng)
      expect(distance).toBeGreaterThan(3000) // Should be ~4000+ km
      expect(distance).toBeLessThan(5000)
    })

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060)
      expect(distance).toBe(0)
    })
  })

  describe('Initials', () => {
    it('should generate initials correctly', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Mary Jane Smith')).toBe('MJ')
      expect(getInitials('Single')).toBe('S')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })
  })
})















