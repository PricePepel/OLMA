import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('club_members')
    .select(`
      *,
      profiles:profile_id (
        id,
        username,
        full_name,
        avatar_url,
        rating
      )
    `)
    .eq('club_id', id)
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ members: data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { profileId, role } = await request.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is owner or moderator
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', id)
    .eq('profile_id', user.id)
    .single()

  if (!membership || !['owner', 'moderator'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('club_members')
    .insert({
      club_id: id,
      profile_id: profileId,
      role: role || 'member',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ member: data })
}
