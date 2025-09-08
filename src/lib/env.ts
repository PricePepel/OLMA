/**
 * Environment variable validation and configuration
 * This module provides safe access to environment variables with proper validation
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  
  // OAuth
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  
  // App
  NEXT_PUBLIC_APP_URL: string
  NEXTAUTH_SECRET?: string
  NEXTAUTH_URL?: string
  
  // Optional services
  OPENAI_API_KEY?: string
  DATABASE_URL?: string
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  CLOUDINARY_CLOUD_NAME?: string
  CLOUDINARY_API_KEY?: string
  CLOUDINARY_API_SECRET?: string
  GOOGLE_ANALYTICS_ID?: string
  MIXPANEL_TOKEN?: string
  SENTRY_DSN?: string
  LOGTAIL_TOKEN?: string
  
  // Feature flags
  ENABLE_AI_MODERATION?: string
  ENABLE_EMAIL_NOTIFICATIONS?: string
  ENABLE_PUSH_NOTIFICATIONS?: string
  ENABLE_ANALYTICS?: string
}

/**
 * Validates and returns environment variables
 * Throws an error if required variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  const isBuildTime = typeof window === 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  
  // Required variables
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
  
  // Check required variables
  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  if (missingVars.length > 0 && !isBuildTime) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  
  // Optional variables
  const optionalVars = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOGTAIL_TOKEN: process.env.LOGTAIL_TOKEN,
    ENABLE_AI_MODERATION: process.env.ENABLE_AI_MODERATION,
    ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS,
    ENABLE_PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH_NOTIFICATIONS,
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
  }
  
  return {
    ...requiredVars,
    ...optionalVars,
  } as EnvConfig
}

/**
 * Safe environment variable getter that doesn't throw during build
 */
export function getEnvVar(key: keyof EnvConfig, defaultValue?: string): string | undefined {
  const isBuildTime = typeof window === 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  
  const value = process.env[key]
  
  if (!value && !defaultValue && !isBuildTime) {
    console.warn(`Environment variable ${key} is not set`)
  }
  
  return value || defaultValue
}

/**
 * Check if we're in a build environment
 */
export function isBuildTime(): boolean {
  return typeof window === 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
