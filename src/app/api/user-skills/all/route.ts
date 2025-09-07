import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all public user skills for the skills directory
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skill_id')
  const category = searchParams.get('category')
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'
  
  const supabase = await createClient()

  let query = supabase
    .from('user_skills')
    .select(`
      *,
      skills (
        id,
        name,
        category,
        description,
        icon
      ),
      users (
        id,
        full_name,
        username,
        avatar_url,
        location
      )
    `)
    .eq('users.status', 'active') // Only show active users
    .order('created_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (skillId) {
    query = query.eq('skill_id', skillId)
  }

  if (category) {
    query = query.eq('skills.category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ userSkills: data })
}





