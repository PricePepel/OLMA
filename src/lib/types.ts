// TypeScript types for OLMA database schema (ER Diagram aligned)

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          timezone: string;
          language: string;
          status: 'active' | 'suspended' | 'banned';
          personal_currency: number;
          level: number;
          experience_points: number;
          streak_days: number;
          rating: number;
          visibility: 'public' | 'private' | 'friends_only';
          location_id: string | null;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          timezone?: string;
          language?: string;
          status?: 'active' | 'suspended' | 'banned';
          personal_currency?: number;
          level?: number;
          experience_points?: number;
          streak_days?: number;
          rating?: number;
          visibility?: 'public' | 'private' | 'friends_only';
          location_id?: string | null;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          timezone?: string;
          language?: string;
          status?: 'active' | 'suspended' | 'banned';
          personal_currency?: number;
          level?: number;
          experience_points?: number;
          streak_days?: number;
          rating?: number;
          visibility?: 'public' | 'private' | 'friends_only';
          location_id?: string | null;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
      };
      profile_skills: {
        Row: {
          id: string;
          profile_id: string;
          skill_id: string;
          proficiency_level: number;
          can_teach: boolean;
          can_learn: boolean;
          hourly_rate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          skill_id: string;
          proficiency_level: number;
          can_teach?: boolean;
          can_learn?: boolean;
          hourly_rate?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          skill_id?: string;
          proficiency_level?: number;
          can_teach?: boolean;
          can_learn?: boolean;
          hourly_rate?: number | null;
          created_at?: string;
        };
      };
      skill_offers: {
        Row: {
          id: string;
          profile_id: string;
          skill_id: string;
          type: 'teach' | 'learn';
          description: string | null;
          price_optional: number | null;
          availability_json: any | null;
          geo_opt_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          skill_id: string;
          type: 'teach' | 'learn';
          description?: string | null;
          price_optional?: number | null;
          availability_json?: any | null;
          geo_opt_in?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          skill_id?: string;
          type?: 'teach' | 'learn';
          description?: string | null;
          price_optional?: number | null;
          availability_json?: any | null;
          geo_opt_in?: boolean;
          created_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          category: string;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          is_public: boolean;
          club_currency: number;
          max_members: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          category: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_public?: boolean;
          club_currency?: number;
          max_members?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          category?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_public?: boolean;
          club_currency?: number;
          max_members?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          profile_id: string;
          role: 'owner' | 'moderator' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          profile_id: string;
          role?: 'owner' | 'moderator' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          profile_id?: string;
          role?: 'owner' | 'moderator' | 'member';
          joined_at?: string;
        };
      };
      club_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          club_id: string;
          profile_id: string | null;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          start_time: string;
          end_time: string;
          max_attendees: number | null;
          status: 'draft' | 'published' | 'cancelled' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          club_id: string;
          profile_id?: string | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          start_time: string;
          end_time: string;
          max_attendees?: number | null;
          status?: 'draft' | 'published' | 'cancelled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          club_id?: string;
          profile_id?: string | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          start_time?: string;
          end_time?: string;
          max_attendees?: number | null;
          status?: 'draft' | 'published' | 'cancelled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          profile_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          profile_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          profile_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          profile_id: string;
          club_id: string | null;
          content: string;
          images: string[] | null;
          is_public: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          club_id?: string | null;
          content: string;
          images?: string[] | null;
          is_public?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          club_id?: string | null;
          content?: string;
          images?: string[] | null;
          is_public?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          media_url: string;
          media_type: 'image' | 'video' | 'document';
          file_name: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          media_url: string;
          media_type: 'image' | 'video' | 'document';
          file_name?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          media_url?: string;
          media_type?: 'image' | 'video' | 'document';
          file_name?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          profile1_id: string;
          profile2_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile1_id: string;
          profile2_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile1_id?: string;
          profile2_id?: string;
          created_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          profile_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          profile_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          profile_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          profile_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          profile_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          profile_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      currency_wallets: {
        Row: {
          id: string;
          profile_id: string;
          club_id: string | null;
          type: 'personal' | 'club';
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          club_id?: string | null;
          type: 'personal' | 'club';
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          club_id?: string | null;
          type?: 'personal' | 'club';
          balance?: number;
          created_at?: string;
        };
      };
      currency_ledger: {
        Row: {
          id: string;
          wallet_id: string;
          delta: number;
          reason: string;
          ref_table: string | null;
          ref_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          delta: number;
          reason: string;
          ref_table?: string | null;
          ref_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          delta?: number;
          reason?: string;
          ref_table?: string | null;
          ref_id?: string | null;
          created_at?: string;
        };
      };
      currency_transactions: {
        Row: {
          id: string;
          profile_id: string;
          club_id: string | null;
          amount: number;
          currency_type: 'personal' | 'club';
          transaction_type: string;
          description: string | null;
          reference_type: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          club_id?: string | null;
          amount: number;
          currency_type: 'personal' | 'club';
          transaction_type: string;
          description?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          club_id?: string | null;
          amount?: number;
          currency_type?: 'personal' | 'club';
          transaction_type?: string;
          description?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
      shop_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'cosmetic' | 'feature' | 'boost';
          price: number;
          currency_type: 'personal' | 'club';
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'cosmetic' | 'feature' | 'boost';
          price: number;
          currency_type: 'personal' | 'club';
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: 'cosmetic' | 'feature' | 'boost';
          price?: number;
          currency_type?: 'personal' | 'club';
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          profile_id: string;
          item_id: string;
          quantity: number;
          total_price: number;
          currency_type: 'personal' | 'club';
          purchased_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          item_id: string;
          quantity?: number;
          total_price: number;
          currency_type: 'personal' | 'club';
          purchased_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          item_id?: string;
          quantity?: number;
          total_price?: number;
          currency_type?: 'personal' | 'club';
          purchased_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned';
          icon: string | null;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned';
          icon?: string | null;
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned';
          icon?: string | null;
          points?: number;
          created_at?: string;
        };
      };
      achievements_user: {
        Row: {
          id: string;
          profile_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
      };
      leaderboard_snapshots: {
        Row: {
          id: string;
          type: 'experience' | 'currency' | 'streak' | 'achievements';
          profile_id: string;
          score: number;
          rank: number;
          snapshot_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'experience' | 'currency' | 'streak' | 'achievements';
          profile_id: string;
          score: number;
          rank: number;
          snapshot_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'experience' | 'currency' | 'streak' | 'achievements';
          profile_id?: string;
          score?: number;
          rank?: number;
          snapshot_date?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          profile_id: string;
          reported_profile_id: string | null;
          reported_post_id: string | null;
          reported_club_id: string | null;
          type: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other';
          reason: string;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          moderator_notes: string | null;
          resolved_by_profile_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          reported_profile_id?: string | null;
          reported_post_id?: string | null;
          reported_club_id?: string | null;
          type: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other';
          reason: string;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          moderator_notes?: string | null;
          resolved_by_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          reported_profile_id?: string | null;
          reported_post_id?: string | null;
          reported_club_id?: string | null;
          type?: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other';
          reason?: string;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          moderator_notes?: string | null;
          resolved_by_profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_restrictions: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          reason: string;
          expires_at: string | null;
          created_by_profile_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type: string;
          reason: string;
          expires_at?: string | null;
          created_by_profile_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          type?: string;
          reason?: string;
          expires_at?: string | null;
          created_by_profile_id?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          title: string;
          message: string;
          data: any | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type: string;
          title: string;
          message: string;
          data?: any | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: any | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          lat: number;
          lng: number;
          address_text: string | null;
          privacy_level: 'public' | 'friends_only' | 'private';
          created_at: string;
        };
        Insert: {
          id?: string;
          lat: number;
          lng: number;
          address_text?: string | null;
          privacy_level?: 'public' | 'friends_only' | 'private';
          created_at?: string;
        };
        Update: {
          id?: string;
          lat?: number;
          lng?: number;
          address_text?: string | null;
          privacy_level?: 'public' | 'friends_only' | 'private';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_status: 'active' | 'suspended' | 'banned';
      club_role: 'owner' | 'moderator' | 'member';
      event_status: 'draft' | 'published' | 'cancelled' | 'completed';
      report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      report_type: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other';
      achievement_type: 'skill_teaching' | 'skill_learning' | 'club_creation' | 'event_attendance' | 'streak' | 'currency_earned';
    };
  };
}

// Convenience types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Skill = Database['public']['Tables']['skills']['Row'];
export type SkillInsert = Database['public']['Tables']['skills']['Insert'];
export type SkillUpdate = Database['public']['Tables']['skills']['Update'];

export type ProfileSkill = Database['public']['Tables']['profile_skills']['Row'];
export type ProfileSkillInsert = Database['public']['Tables']['profile_skills']['Insert'];
export type ProfileSkillUpdate = Database['public']['Tables']['profile_skills']['Update'];

export type SkillOffer = Database['public']['Tables']['skill_offers']['Row'];
export type SkillOfferInsert = Database['public']['Tables']['skill_offers']['Insert'];
export type SkillOfferUpdate = Database['public']['Tables']['skill_offers']['Update'];

export type Club = Database['public']['Tables']['clubs']['Row'];
export type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
export type ClubUpdate = Database['public']['Tables']['clubs']['Update'];

export type ClubMember = Database['public']['Tables']['club_members']['Row'];
export type ClubMemberInsert = Database['public']['Tables']['club_members']['Insert'];
export type ClubMemberUpdate = Database['public']['Tables']['club_members']['Update'];

export type ClubEvent = Database['public']['Tables']['club_events']['Row'];
export type ClubEventInsert = Database['public']['Tables']['club_events']['Insert'];
export type ClubEventUpdate = Database['public']['Tables']['club_events']['Update'];

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type CurrencyWallet = Database['public']['Tables']['currency_wallets']['Row'];
export type CurrencyWalletInsert = Database['public']['Tables']['currency_wallets']['Insert'];
export type CurrencyWalletUpdate = Database['public']['Tables']['currency_wallets']['Update'];

export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];
export type AchievementUpdate = Database['public']['Tables']['achievements']['Update'];

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export type Location = Database['public']['Tables']['locations']['Row'];
export type LocationInsert = Database['public']['Tables']['locations']['Insert'];
export type LocationUpdate = Database['public']['Tables']['locations']['Update'];


