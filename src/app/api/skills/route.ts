import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Skills API: GET request received')
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'
    
    console.log('Skills API: Query params:', { search, category, limit, offset })
    
    const supabase = await createClient()
    console.log('Skills API: Supabase client created')

    let query = supabase
      .from('skills')
      .select('*')
      .order('name')
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    console.log('Skills API: Executing query...')
    const { data, error } = await query
    console.log('Skills API: Query result:', { data: data?.length || 0, error })

    if (error) {
      console.log('Skills API: Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Skills API: Successfully returned skills')
    return NextResponse.json({ skills: data })
  } catch (error) {
    console.error('Skills API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { name, description, category } = await request.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('skills')
    .insert({
      name,
      description,
      category,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ skill: data })
}
