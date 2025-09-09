import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test if users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('Users table error:', usersError)
      return NextResponse.json({
        success: false,
        error: 'Users table error',
        details: usersError
      }, { status: 500 })
    }
    
    // Test if skills table exists
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .limit(5)
    
    // Test if clubs table exists
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .limit(5)
    
    return NextResponse.json({
      success: true,
      message: 'Database schema test',
      data: {
        users: {
          count: users?.length || 0,
          sample: users?.slice(0, 2) || [],
          error: usersError
        },
        skills: {
          count: skills?.length || 0,
          sample: skills?.slice(0, 2) || [],
          error: skillsError
        },
        clubs: {
          count: clubs?.length || 0,
          sample: clubs?.slice(0, 2) || [],
          error: clubsError
        }
      }
    })
  } catch (error) {
    console.error('Test env error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test database schema',
      details: error
    }, { status: 500 })
  }
}








