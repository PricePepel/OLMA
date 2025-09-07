import { 
  createPostSchema, 
  createClubSchema, 
  createEventSchema, 
  createSkillOfferSchema, 
  createMessageSchema, 
  createReportSchema,
  reportActionSchema,
  userRestrictionSchema,
  purchaseItemSchema
} from '../api'

describe('API Validation Schemas', () => {
  describe('createPostSchema', () => {
    it('should validate a valid post', () => {
      const validPost = {
        content: 'This is a valid post content',
        mediaUrls: ['https://example.com/image.jpg'],
        privacyLevel: 'public' as const,
        clubId: '123e4567-e89b-12d3-a456-426614174000'
      }

      const result = createPostSchema.safeParse(validPost)
      expect(result.success).toBe(true)
    })

    it('should reject empty content', () => {
      const invalidPost = {
        content: '',
        privacyLevel: 'public' as const
      }

      const result = createPostSchema.safeParse(invalidPost)
      expect(result.success).toBe(false)
    })
  })

  describe('createClubSchema', () => {
    it('should validate a valid club', () => {
      const validClub = {
        name: 'Test Club',
        description: 'A test club description',
        bannerUrl: 'https://example.com/banner.jpg',
        isPrivate: false
      }

      const result = createClubSchema.safeParse(validClub)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidClub = {
        name: '',
        description: 'Valid description'
      }

      const result = createClubSchema.safeParse(invalidClub)
      expect(result.success).toBe(false)
    })
  })

  describe('createEventSchema', () => {
    it('should validate a valid event', () => {
      const validEvent = {
        title: 'Test Event',
        description: 'A test event description',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T12:00:00Z',
        location: 'Test Location',
        maxParticipants: 50,
        clubId: '123e4567-e89b-12d3-a456-426614174000'
      }

      const result = createEventSchema.safeParse(validEvent)
      expect(result.success).toBe(true)
    })
  })

  describe('createSkillOfferSchema', () => {
    it('should validate a valid skill offer', () => {
      const validOffer = {
        skillName: 'JavaScript',
        offerType: 'teach' as const,
        description: 'I can teach JavaScript',
        location: 'New York',
        latitude: 40.7128,
        longitude: -74.0060
      }

      const result = createSkillOfferSchema.safeParse(validOffer)
      expect(result.success).toBe(true)
    })
  })

  describe('createMessageSchema', () => {
    it('should validate a valid message', () => {
      const validMessage = {
        content: 'Hello, how are you?',
        conversationId: '123e4567-e89b-12d3-a456-426614174000'
      }

      const result = createMessageSchema.safeParse(validMessage)
      expect(result.success).toBe(true)
    })
  })

  describe('createReportSchema', () => {
    it('should validate a valid report', () => {
      const validReport = {
        target_type: 'post' as const,
        target_id: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'inappropriate_content' as const,
        description: 'This post contains inappropriate content'
      }

      const result = createReportSchema.safeParse(validReport)
      expect(result.success).toBe(true)
    })
  })
})
