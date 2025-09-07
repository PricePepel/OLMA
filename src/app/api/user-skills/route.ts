import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET user skills
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skills (
        id,
        name,
        category,
        description,
        icon
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ userSkills: data })
}

// POST new user skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API: Received request body:', body)
    
    const { user_id, skill_id, proficiency_level, can_teach, can_learn, hourly_rate } = body
    
    console.log('API: Parsed data:', { user_id, skill_id, proficiency_level, can_teach, can_learn, hourly_rate })
    
    if (!user_id || !skill_id) {
      console.log('API: Missing required fields:', { user_id: !!user_id, skill_id: !!skill_id })
      return NextResponse.json({ error: 'User ID and Skill ID are required' }, { status: 400 })
    }

    const supabase = await createClient()
    console.log('API: Supabase client created')

    // Verify the user is authenticated and owns this user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('API: Auth check result:', { user: !!user, userId: user?.id, authError })
    
    if (!user || user.id !== user_id) {
      console.log('API: Unauthorized - user mismatch:', { 
        authenticatedUser: user?.id, 
        requestedUserId: user_id,
        isAuthenticated: !!user 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has this skill
    console.log('API: Checking for existing skill...')
    const { data: existingSkill, error: checkError } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', user_id)
      .eq('skill_id', skill_id)
      .single()

    console.log('API: Existing skill check:', { existingSkill, checkError })

    if (existingSkill) {
      console.log('API: User already has this skill')
      return NextResponse.json({ error: 'User already has this skill' }, { status: 400 })
    }

    // Create the user skill
    console.log('API: Creating new user skill...')
    const { data, error } = await supabase
      .from('user_skills')
      .insert({
        user_id,
        skill_id,
        proficiency_level: proficiency_level || 3,
        can_teach: can_teach || false,
        can_learn: can_learn || true,
        hourly_rate: hourly_rate || null,
      })
      .select(`
        *,
        skills (
          id,
          name,
          category,
          description,
          icon
        )
      `)
      .single()

    console.log('API: Insert result:', { data, error })

    if (error) {
      console.log('API: Database error during insert:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('API: Successfully created user skill')
    return NextResponse.json({ userSkill: data }, { status: 201 })
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
