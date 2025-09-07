// Content filtering and moderation utilities

export interface ContentFilterResult {
  isClean: boolean
  violations: string[]
  confidence?: number
}

export interface RateLimitResult {
  allowed: boolean
  remainingTime: number
}

// Basic profanity patterns (MVP version)
const PROFANITY_PATTERNS = [
  /\b(damn|hell|shit|fuck|bitch|ass)\b/gi,
  /\b(asshole|bastard|dick|pussy)\b/gi,
]

// PII patterns
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}-\d{3}-\d{4}\b/g, // Phone number (US format)
  /\b\d{3}\.\d{3}\.\d{4}\b/g, // Phone number (dotted format)
  /\b\d{10}\b/g, // 10-digit phone number
]

// Spam patterns
const SPAM_PATTERNS = [
  /\b(BUY NOW|LIMITED TIME|CLICK HERE|FREE OFFER|MAKE MONEY|GET RICH)\b/gi,
  /!{3,}/g, // Multiple exclamation marks
  /\b[A-Z]{5,}\b/g, // ALL CAPS words
]

export function filterContent(content: string): ContentFilterResult {
  const violations: string[] = []
  
  // Check for profanity
  const hasProfanity = PROFANITY_PATTERNS.some(pattern => pattern.test(content))
  if (hasProfanity) {
    violations.push('profanity')
  }
  
  // Check for PII
  const hasPII = PII_PATTERNS.some(pattern => pattern.test(content))
  if (hasPII) {
    violations.push('pii')
  }
  
  // Check for spam patterns
  const hasSpam = SPAM_PATTERNS.some(pattern => pattern.test(content))
  if (hasSpam) {
    violations.push('spam')
  }
  
  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/)
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const maxRepetition = Math.max(...Object.values(wordCounts))
  if (maxRepetition > 5) {
    violations.push('repetition')
  }
  
  // Check for excessive capitalization
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (upperCaseRatio > 0.7 && content.length > 10) {
    violations.push('capitalization')
  }
  
  return {
    isClean: violations.length === 0,
    violations
  }
}

export async function filterContentWithAI(content: string): Promise<ContentFilterResult> {
  // First run basic filtering
  const basicResult = filterContent(content)
  
  // If OpenAI is enabled, enhance with AI moderation
  if (process.env.OPENAI_API_KEY && process.env.ENABLE_AI_MODERATION === 'true') {
    try {
      const aiResult = await filterContentWithOpenAI(content)
      return {
        isClean: basicResult.isClean && aiResult.isClean,
        violations: [...new Set([...basicResult.violations, ...aiResult.violations])],
        confidence: aiResult.confidence
      }
    } catch (error) {
      console.warn('OpenAI moderation failed, falling back to basic filtering:', error)
      return basicResult
    }
  }
  
  return basicResult
}

async function filterContentWithOpenAI(content: string): Promise<ContentFilterResult> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    
    const data = await response.json()
    const result = data.results[0]
    
    const violations: string[] = []
    if (result.flagged) {
      if (result.categories.hate) violations.push('hate_speech')
      if (result.categories.hate_threatening) violations.push('hate_speech')
      if (result.categories.self_harm) violations.push('self_harm')
      if (result.categories.sexual) violations.push('sexual_content')
      if (result.categories.sexual_minors) violations.push('sexual_content')
      if (result.categories.violence) violations.push('violence')
      if (result.categories.violence_graphic) violations.push('violence')
    }
    
    return {
      isClean: !result.flagged,
      violations,
      confidence: Math.max(...Object.values(result.category_scores as Record<string, number>))
    }
  } catch (error) {
    console.error('OpenAI moderation error:', error)
    throw error
  }
}

// Rate limiting for content creation
const rateLimitCache = new Map<string, number>()

export function checkContentCreationRateLimit(userId: string): RateLimitResult {
  const now = Date.now()
  const lastCreation = rateLimitCache.get(userId) || 0
  const timeSinceLastCreation = now - lastCreation
  const minInterval = 2 * 60 * 1000 // 2 minutes
  
  if (timeSinceLastCreation < minInterval) {
    return {
      allowed: false,
      remainingTime: minInterval - timeSinceLastCreation
    }
  }
  
  // Update the last creation time
  rateLimitCache.set(userId, now)
  
  return {
    allowed: true,
    remainingTime: 0
  }
}

// Clean up old entries from rate limit cache
setInterval(() => {
  const now = Date.now()
  const maxAge = 10 * 60 * 1000 // 10 minutes
  
  for (const [userId, timestamp] of rateLimitCache.entries()) {
    if (now - timestamp > maxAge) {
      rateLimitCache.delete(userId)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

// Moderation action logging
export interface ModerationAction {
  id: string
  moderatorId: string
  targetType: 'post' | 'user' | 'club' | 'event'
  targetId: string
  action: 'warning' | 'mute' | 'ban' | 'delete' | 'resolve' | 'dismiss'
  reason: string
  duration?: number // in minutes
  createdAt: string
}

export async function logModerationAction(
  supabase: any,
  action: Omit<ModerationAction, 'id' | 'createdAt'>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('moderation_actions')
      .insert({
        moderator_id: action.moderatorId,
        target_type: action.targetType,
        target_id: action.targetId,
        action: action.action,
        reason: action.reason,
        duration: action.duration,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log moderation action:', error)
      throw error
    }
  } catch (error) {
    console.error('Error logging moderation action:', error)
    // Don't throw here to avoid breaking the main flow
  }
}
