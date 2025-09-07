import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { getEnvVar, isBuildTime } from './env'

// Helper function to get environment variables safely
function getSupabaseConfig() {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return null instead of throwing
    if (isBuildTime()) {
      console.warn('Missing Supabase environment variables during build')
      return null
    }
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Create a lazy-initialized client
let _supabase: ReturnType<typeof createClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!_supabase) {
      const config = getSupabaseConfig()
      if (!config) {
        // Return a mock client during build
        return () => Promise.resolve({ data: null, error: null })
      }
      _supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    }
    return _supabase[prop as keyof typeof _supabase]
  }
})

export const createClientComponentClient = () => {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Missing Supabase environment variables')
  }
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey)
}

export const createServerComponentClient = () => {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          username: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          timezone: string
          language: string
          status: 'active' | 'suspended' | 'banned'
          personal_currency: number
          level: number
          experience_points: number
          streak_days: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string
          language?: string
          status?: 'active' | 'suspended' | 'banned'
          personal_currency?: number
          level?: number
          experience_points?: number
          streak_days?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string
          language?: string
          status?: 'active' | 'suspended' | 'banned'
          personal_currency?: number
          level?: number
          experience_points?: number
          streak_days?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          proficiency_level: number
          can_teach: boolean
          can_learn: boolean
          hourly_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          proficiency_level: number
          can_teach?: boolean
          can_learn?: boolean
          hourly_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          proficiency_level?: number
          can_teach?: boolean
          can_learn?: boolean
          hourly_rate?: number | null
          created_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string | null
          avatar_url: string | null
          cover_url: string | null
          category: string
          location: string | null
          latitude: number | null
          longitude: number | null
          is_public: boolean
          club_currency: number
          max_members: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          category: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          is_public?: boolean
          club_currency?: number
          max_members?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          category?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          is_public?: boolean
          club_currency?: number
          max_members?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      club_members: {
        Row: {
          id: string
          club_id: string
          user_id: string
          role: 'owner' | 'moderator' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          role?: 'owner' | 'moderator' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          role?: 'owner' | 'moderator' | 'member'
          joined_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          club_id: string | null
          created_by: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          start_time: string
          end_time: string
          max_attendees: number | null
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          club_id?: string | null
          created_by?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time: string
          end_time: string
          max_attendees?: number | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          club_id?: string | null
          created_by?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time?: string
          end_time?: string
          max_attendees?: number | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          club_id: string | null
          content: string
          images: string[] | null
          is_public: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          club_id?: string | null
          content: string
          images?: string[] | null
          is_public?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          club_id?: string | null
          content?: string
          images?: string[] | null
          is_public?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned'
          icon: string | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned'
          icon?: string | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned'
          icon?: string | null
          points?: number
          created_at?: string
        }
      }
    }
  }
}

