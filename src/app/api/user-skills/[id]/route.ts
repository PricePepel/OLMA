import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH update user skill
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const updates = await request.json()
  
  const supabase = await createClient()

  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the user owns this skill
  const { data: existingSkill } = await supabase
    .from('user_skills')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingSkill || existingSkill.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Update the user skill
  const { data, error } = await supabase
    .from('user_skills')
    .update(updates)
    .eq('id', id)
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ userSkill: data })
}

// DELETE user skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const supabase = await createClient()

  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the user owns this skill
  const { data: existingSkill } = await supabase
    .from('user_skills')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingSkill || existingSkill.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete the user skill
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Skill removed successfully' })
}



