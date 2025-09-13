import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Test DB API: Testing database connection...')
    
    const supabase = await createClient()
    console.log('Test DB API: Supabase client created')

    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Test DB API: Auth test:', { user: !!user, authError })

    // Test if skills table exists
    console.log('Test DB API: Testing skills table...')
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills')
      .select('count')
      .limit(1)

    console.log('Test DB API: Skills table test:', { skillsData, skillsError })

    // Test if user_skills table exists
    console.log('Test DB API: Testing user_skills table...')
    const { data: userSkillsData, error: userSkillsError } = await supabase
      .from('user_skills')
      .select('count')
      .limit(1)

    console.log('Test DB API: User skills table test:', { userSkillsData, userSkillsError })

    return NextResponse.json({
      message: 'Database connection test completed',
      auth: { hasUser: !!user, error: authError?.message },
      skillsTable: { exists: !skillsError, error: skillsError?.message },
      userSkillsTable: { exists: !userSkillsError, error: userSkillsError?.message }
    })
  } catch (error) {
    console.error('Test DB API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}








