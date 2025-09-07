import { calculateXPForAction, calculateLevel } from '../gamification'

describe('Gamification System', () => {
  describe('calculateXPForAction', () => {
    it('should calculate XP for post creation', () => {
      const xp = calculateXPForAction('create_post')
      expect(xp).toBe(10)
    })
  })

  describe('calculateLevel', () => {
    it('should calculate level 1 for 0 XP', () => {
      const level = calculateLevel(0)
      expect(level).toBe(1)
    })
  })
})
