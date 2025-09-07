'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { User as UserProfile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: any }>
  signInWithGitHub: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache for profile data to avoid repeated fetches
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Create Supabase client with error handling
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (error) {
      console.warn('Failed to create Supabase client:', error)
      return null
    }
  }, [])

  // Memoized profile fetching with caching
  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      console.warn('Supabase client not available, skipping profile fetch')
      return
    }
    
    try {
      // Check cache first
      const cached = profileCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached profile for user:', userId)
        setProfile(cached.profile)
        return
      }

      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // Try to create profile if it doesn't exist
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            console.log('Creating profile for user:', user.id)
            
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || 'Anonymous User',
                username: user.user_metadata?.username || generateUsername(user.user_metadata?.full_name || 'user'),
              })
            
            if (createError) {
              console.error('Error creating profile:', createError)
            } else {
              console.log('Profile created successfully, fetching new profile')
              
              const { data: newProfile, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()
              
              if (fetchError) {
                console.error('Error fetching new profile:', fetchError)
              } else if (newProfile) {
                console.log('New profile fetched successfully:', newProfile)
                // Cache the new profile
                profileCache.set(userId, { profile: newProfile, timestamp: Date.now() })
                setProfile(newProfile)
              }
            }
          }
        } catch (createError) {
          console.error('fetchProfile - Profile creation failed:', createError)
        }
        return
      }

      console.log('Profile fetched successfully:', data)
      // Cache the profile
      profileCache.set(userId, { profile: data, timestamp: Date.now() })
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      
      try {
        // Check if we have a cached session first
        const cachedSession = localStorage.getItem('supabase.auth.token')
        if (cachedSession) {
          try {
            const parsed = JSON.parse(cachedSession)
            if (parsed && parsed.access_token) {
              // Set loading to false immediately if we have cached data
              setLoading(false)
              // Then fetch fresh data in background
              const { data: { session }, error } = await supabase.auth.getSession()
              if (!error && session) {
                setSession(session)
                setUser(session.user)
                if (session.user) {
                  fetchProfile(session.user.id)
                }
              }
              return
            }
          } catch (e) {
            // Invalid cache, continue with normal flow
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch profile if user exists
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('AuthProvider - Error getting session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    if (!supabase) {
      setLoading(false)
      return
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Don't await this to avoid blocking UI
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          // Clear cache when user signs out
          profileCache.clear()
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') }
    }
    
    const username = generateUsername(fullName)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    })

    if (!error && data.user) {
      // Create profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          username: username,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { error: profileError }
      }
    }

    return { error }
  }

  const signOut = async () => {
    if (!supabase) {
      return
    }
    
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') }
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signInWithGitHub = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') }
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') }
    }
    
    if (!user) return { error: new Error('No user logged in') }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }

    return { error }
  }

  const generateUsername = (fullName: string) => {
    const base = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15)
    
    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 6)
    return `${base}${suffix}`
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
