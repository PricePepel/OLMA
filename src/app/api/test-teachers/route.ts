import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all users who can teach any skill
    const { data: teachers, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        users (
          id,
          full_name,
          username
        ),
        skills (
          id,
          name,
          category
        )
      `)
      .eq('can_teach', true)

    if (error) {
      console.error('Error fetching teachers:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      teachers: teachers || [],
      count: teachers?.length || 0
    })
  } catch (error) {
    console.error('GET /api/test-teachers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
