// Gamification system for OLMA MVP

export interface XPConfig {
  action: string
  baseXP: number
  multiplier?: number
  maxPerDay?: number
}

export interface LevelConfig {
  level: number
  minXP: number
  maxXP: number
  title: string
  rewards?: {
    personalCurrency?: number
    clubCurrency?: number
    features?: string[]
  }
}

// XP earning configuration
const XP_CONFIGS: Record<string, XPConfig> = {
  create_post: { action: 'create_post', baseXP: 10, maxPerDay: 50 },
  like_post: { action: 'like_post', baseXP: 1, maxPerDay: 100 },
  comment_post: { action: 'comment_post', baseXP: 5, maxPerDay: 50 },
  create_skill_offer: { action: 'create_skill_offer', baseXP: 25, maxPerDay: 10 },
  complete_skill_exchange: { action: 'complete_skill_exchange', baseXP: 50, maxPerDay: 5 },
  create_club: { action: 'create_club', baseXP: 100, maxPerDay: 1 },
  join_club: { action: 'join_club', baseXP: 15, maxPerDay: 5 },
  create_event: { action: 'create_event', baseXP: 30, maxPerDay: 10 },
  attend_event: { action: 'attend_event', baseXP: 20, maxPerDay: 5 },
  daily_login: { action: 'daily_login', baseXP: 5, maxPerDay: 1 },
  weekly_streak: { action: 'weekly_streak', baseXP: 50, maxPerDay: 1 },
  monthly_streak: { action: 'monthly_streak', baseXP: 200, maxPerDay: 1 },
  achievement_unlocked: { action: 'achievement_unlocked', baseXP: 100, maxPerDay: 10 },
  help_other_user: { action: 'help_other_user', baseXP: 15, maxPerDay: 20 },
  receive_positive_feedback: { action: 'receive_positive_feedback', baseXP: 10, maxPerDay: 50 },
}

// Level configuration
const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, minXP: 0, maxXP: 99, title: 'Novice Learner' },
  { level: 2, minXP: 100, maxXP: 299, title: 'Curious Explorer', rewards: { personalCurrency: 50 } },
  { level: 3, minXP: 300, maxXP: 599, title: 'Active Participant', rewards: { personalCurrency: 100 } },
  { level: 4, minXP: 600, maxXP: 999, title: 'Skill Sharer', rewards: { personalCurrency: 150, clubCurrency: 25 } },
  { level: 5, minXP: 1000, maxXP: 1999, title: 'Community Builder', rewards: { personalCurrency: 200, clubCurrency: 50 } },
  { level: 6, minXP: 2000, maxXP: 3999, title: 'Knowledge Guardian', rewards: { personalCurrency: 300, clubCurrency: 75 } },
  { level: 7, minXP: 4000, maxXP: 6999, title: 'Learning Champion', rewards: { personalCurrency: 400, clubCurrency: 100 } },
  { level: 8, minXP: 7000, maxXP: 11999, title: 'Wisdom Keeper', rewards: { personalCurrency: 500, clubCurrency: 125 } },
  { level: 9, minXP: 12000, maxXP: 19999, title: 'Master Teacher', rewards: { personalCurrency: 600, clubCurrency: 150 } },
  { level: 10, minXP: 20000, maxXP: 999999, title: 'OLMA Legend', rewards: { personalCurrency: 1000, clubCurrency: 250 } },
]

// Currency earning configuration
const CURRENCY_CONFIGS = {
  personal: {
    create_post: 5,
    like_post: 1,
    comment_post: 2,
    create_skill_offer: 10,
    complete_skill_exchange: 25,
    create_club: 50,
    join_club: 5,
    create_event: 15,
    attend_event: 10,
    daily_login: 2,
    weekly_streak: 25,
    monthly_streak: 100,
    achievement_unlocked: 50,
    help_other_user: 5,
    receive_positive_feedback: 3,
  },
  club: {
    create_club: 100,
    create_event: 30,
    attend_event: 15,
    moderate_content: 10,
    help_member: 5,
  }
}

export function calculateXPForAction(action: string): number {
  const config = XP_CONFIGS[action]
  if (!config) {
    console.warn(`Unknown XP action: ${action}`)
    return 0
  }
  return config.baseXP
}

export function calculateLevel(xp: number): LevelConfig {
  for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_CONFIGS[i].minXP) {
      return LEVEL_CONFIGS[i]
    }
  }
  return LEVEL_CONFIGS[0]
}

export function calculateXPToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const nextLevel = LEVEL_CONFIGS.find(level => level.level === currentLevel.level + 1)
  
  if (!nextLevel) {
    return 0 // Already at max level
  }
  
  return nextLevel.minXP - currentXP
}

export function calculatePersonalCurrencyForAction(action: string): number {
  return CURRENCY_CONFIGS.personal[action as keyof typeof CURRENCY_CONFIGS.personal] || 0
}

export function calculateClubCurrencyForAction(action: string): number {
  return CURRENCY_CONFIGS.club[action as keyof typeof CURRENCY_CONFIGS.club] || 0
}

export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 200 // Monthly streak
  if (streakDays >= 7) return 50   // Weekly streak
  if (streakDays >= 3) return 10   // 3-day streak
  return 0
}

export function calculateLevelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const levelXP = currentXP - currentLevel.minXP
  const levelRange = currentLevel.maxXP - currentLevel.minXP
  
  if (levelRange === 0) return 100
  
  return Math.min(100, Math.max(0, (levelXP / levelRange) * 100))
}

// Achievement system
export type AchievementId = 
  | 'first_post'
  | 'first_meetup'
  | 'seven_day_streak'
  | 'thirty_day_streak'
  | 'skill_master'
  | 'currency_collector'
  | 'social_butterfly'
  | 'helper'
  | 'skill_teacher'
  | 'skill_learner'
  | 'club_creator'
  | 'event_organizer'
  | 'streak_7'
  | 'streak_30'
  | 'helpful_member'

export interface Achievement {
  id: string
  name: string
  description: string
  type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned' | 'social_interaction'
  criteria: {
    action: string
    count: number
    timeframe?: 'day' | 'week' | 'month' | 'all_time'
  }
  rewards: {
    xp: number
    personalCurrency?: number
    clubCurrency?: number
    badge?: string
  }
  icon?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_post',
    name: 'First Steps',
    description: 'Create your first post',
    type: 'social_interaction',
    criteria: { action: 'create_post', count: 1 },
    rewards: { xp: 50, personalCurrency: 25 }
  },
  {
    id: 'skill_teacher',
    name: 'Knowledge Sharer',
    description: 'Create your first skill offer',
    type: 'skill_teaching',
    criteria: { action: 'create_skill_offer', count: 1 },
    rewards: { xp: 100, personalCurrency: 50 }
  },
  {
    id: 'skill_learner',
    name: 'Eager Student',
    description: 'Complete your first skill exchange',
    type: 'skill_learning',
    criteria: { action: 'complete_skill_exchange', count: 1 },
    rewards: { xp: 150, personalCurrency: 75 }
  },
  {
    id: 'club_creator',
    name: 'Community Leader',
    description: 'Create your first club',
    type: 'club_creation',
    criteria: { action: 'create_club', count: 1 },
    rewards: { xp: 200, personalCurrency: 100, clubCurrency: 50 }
  },
  {
    id: 'event_organizer',
    name: 'Event Master',
    description: 'Create your first event',
    type: 'event_attendance',
    criteria: { action: 'create_event', count: 1 },
    rewards: { xp: 100, personalCurrency: 50, clubCurrency: 25 }
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day login streak',
    type: 'streak',
    criteria: { action: 'daily_login', count: 7, timeframe: 'week' },
    rewards: { xp: 100, personalCurrency: 50 }
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day login streak',
    type: 'streak',
    criteria: { action: 'daily_login', count: 30, timeframe: 'month' },
    rewards: { xp: 500, personalCurrency: 200 }
  },
  {
    id: 'helpful_member',
    name: 'Helpful Hand',
    description: 'Help 10 other users',
    type: 'social_interaction',
    criteria: { action: 'help_other_user', count: 10 },
    rewards: { xp: 200, personalCurrency: 100 }
  },
  {
    id: 'currency_collector',
    name: 'Currency Collector',
    description: 'Earn 1000 personal currency',
    type: 'currency_earned',
    criteria: { action: 'earn_personal_currency', count: 1000 },
    rewards: { xp: 300, personalCurrency: 150 }
  }
]

export function checkAchievements(
  userStats: {
    totalPosts: number
    totalSkillOffers: number
    totalSkillExchanges: number
    totalClubs: number
    totalEvents: number
    streakDays: number
    totalHelpGiven: number
    totalPersonalCurrency: number
  }
): string[] {
  const unlockedAchievements: string[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    const { action, count, timeframe } = achievement.criteria
    
    let currentCount = 0
    switch (action) {
      case 'create_post':
        currentCount = userStats.totalPosts
        break
      case 'create_skill_offer':
        currentCount = userStats.totalSkillOffers
        break
      case 'complete_skill_exchange':
        currentCount = userStats.totalSkillExchanges
        break
      case 'create_club':
        currentCount = userStats.totalClubs
        break
      case 'create_event':
        currentCount = userStats.totalEvents
        break
      case 'daily_login':
        currentCount = userStats.streakDays
        break
      case 'help_other_user':
        currentCount = userStats.totalHelpGiven
        break
      case 'earn_personal_currency':
        currentCount = userStats.totalPersonalCurrency
        break
    }
    
    if (currentCount >= count) {
      unlockedAchievements.push(achievement.id)
    }
  }
  
  return unlockedAchievements
}

// Leaderboard calculations
export function calculateLeaderboardScore(userStats: {
  totalXP: number
  totalPosts: number
  totalSkillExchanges: number
  totalEvents: number
  averageRating: number
  streakDays: number
}): number {
  return (
    userStats.totalXP * 1 +
    userStats.totalPosts * 10 +
    userStats.totalSkillExchanges * 50 +
    userStats.totalEvents * 30 +
    userStats.averageRating * 100 +
    userStats.streakDays * 5
  )
}

// Formatting utilities
export function formatCurrency(amount: number, type: 'personal' | 'club' = 'personal'): string {
  const symbol = type === 'personal' ? '🪙' : '🏆'
  return `${symbol}${amount.toLocaleString()}`
}

export function formatExperience(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`
  }
  return `${xp} XP`
}

export function getLevelTitle(level: number): string {
  const levelConfig = LEVEL_CONFIGS.find(config => config.level === level)
  return levelConfig?.title || 'Unknown Level'
}
