import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Fix User Profile API: Starting...')
    
    const supabase = await createClient()
    console.log('Fix User Profile API: Supabase client created')

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Fix User Profile API: Auth check:', { user: !!user, userId: user?.id, authError })

    if (!user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    // Check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Fix User Profile API: Profile check:', { existingProfile, profileError })

    if (existingProfile) {
      console.log('Fix User Profile API: Profile already exists')
      return NextResponse.json({ 
        message: 'Profile already exists',
        profile: existingProfile
      })
    }

    // Create the user profile
    console.log('Fix User Profile API: Creating profile for user:', user.id)
    
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Anonymous User',
        username: user.user_metadata?.username || generateUsername(user.user_metadata?.full_name || 'user'),
        status: 'active',
        personal_currency: 0,
        level: 1,
        experience_points: 0,
        streak_days: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error('Fix User Profile API: Error creating profile:', createError)
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: createError.message
      }, { status: 500 })
    }

    console.log('Fix User Profile API: Profile created successfully:', newProfile)
    
    return NextResponse.json({ 
      message: 'Profile created successfully',
      profile: newProfile
    })

  } catch (error) {
    console.error('Fix User Profile API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateUsername(fullName: string) {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15)
  
  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}${suffix}`
}







