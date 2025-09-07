export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          member_count: number
          event_count: number
          owner_id: string
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
          member_count?: number
          event_count?: number
          owner_id: string
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
          member_count?: number
          event_count?: number
          owner_id?: string
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
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      currency_transactions: {
        Row: {
          id: string
          wallet_id: string
          amount: number
          type: 'earn' | 'spend' | 'transfer'
          description: string
          reference_type: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          amount: number
          type: 'earn' | 'spend' | 'transfer'
          description: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          amount?: number
          type?: 'earn' | 'spend' | 'transfer'
          description?: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      currency_wallets: {
        Row: {
          id: string
          user_id: string | null
          club_id: string | null
          type: 'personal' | 'club'
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          club_id?: string | null
          type: 'personal' | 'club'
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          club_id?: string | null
          type?: 'personal' | 'club'
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          location: string
          max_participants: number
          current_participants: number
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          club_id: string | null
          creator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_time: string
          end_time: string
          location: string
          max_participants?: number
          current_participants?: number
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          club_id?: string | null
          creator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          location?: string
          max_participants?: number
          current_participants?: number
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          club_id?: string | null
          creator_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          joined_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          conversation_id: string
          sender_id: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          conversation_id: string
          sender_id: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          conversation_id?: string
          sender_id?: string
          read_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          reference_type: string | null
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          reference_type?: string | null
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          reference_type?: string | null
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          content: string
          media_urls: string[] | null
          privacy_level: 'public' | 'club' | 'private'
          user_id: string
          club_id: string | null
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          media_urls?: string[] | null
          privacy_level?: 'public' | 'club' | 'private'
          user_id: string
          club_id?: string | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          media_urls?: string[] | null
          privacy_level?: 'public' | 'club' | 'private'
          user_id?: string
          club_id?: string | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          target_type: string
          target_id: string
          reason: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other'
          description: string | null
          reporter_id: string
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          moderator_id: string | null
          moderator_notes: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          target_type: string
          target_id: string
          reason: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other'
          description?: string | null
          reporter_id: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          moderator_id?: string | null
          moderator_notes?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          target_type?: string
          target_id?: string
          reason?: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other'
          description?: string | null
          reporter_id?: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          moderator_id?: string | null
          moderator_notes?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
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
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      user_restrictions: {
        Row: {
          id: string
          user_id: string
          type: 'warning' | 'mute' | 'ban'
          reason: string
          expires_at: string | null
          moderator_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'warning' | 'mute' | 'ban'
          reason: string
          expires_at?: string | null
          moderator_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'warning' | 'mute' | 'ban'
          reason?: string
          expires_at?: string | null
          moderator_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Type aliases for convenience
export type User = Tables<'users'>
export type Club = Tables<'clubs'>
export type Event = Tables<'events'>
export type Post = Tables<'posts'>
export type Message = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type Skill = Tables<'skills'>
export type UserSkill = Tables<'user_skills'>
export type Achievement = Tables<'achievements'>
export type Report = Tables<'reports'>
export type Notification = Tables<'notifications'>
export type CurrencyTransaction = Tables<'currency_transactions'>
export type CurrencyWallet = Tables<'currency_wallets'>

// Extended types for components
export type UserWithSkills = User & {
  user_skills: (UserSkill & {
    skill: Skill
  })[]
}

export type ClubWithDetails = Club & {
  owner: User
  member_count: number
  event_count: number
  user_membership?: {
    role: string
    joined_at: string
  } | null
}

export type EventWithDetails = Event & {
  creator: User
  club?: Club
  attendee_count: number
  user_attendance?: {
    status: string
  }
}

export type PostWithDetails = Post & {
  user: User
  club?: Club
  likes: number
  is_liked: boolean
}

export type MessageWithSender = Message & {
  sender: User
}

export type ConversationWithParticipants = Conversation & {
  participants: User[]
  last_message?: MessageWithSender
}

export type SkillWithUserData = Skill & {
  user_skill?: UserSkill
}

export type UserSkillWithSkill = UserSkill & {
  skill: Skill
}

