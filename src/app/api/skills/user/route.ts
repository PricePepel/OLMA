import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Authentication required')
    }

    const body = await request.json()
    const { skill_id, can_teach, can_learn, proficiency_level } = body

    // Validate required fields
    if (!skill_id || proficiency_level === undefined) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'skill_id and proficiency_level are required')
    }

    // Validate proficiency level
    if (proficiency_level < 1 || proficiency_level > 5) {
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, 'proficiency_level must be between 1 and 5')
    }

    // Check if skill exists
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('id', skill_id)
      .single()

    if (skillError || !skill) {
      return createErrorResponse(ApiErrorCode.NOT_FOUND, 'Skill not found')
    }

    // Check if user already has this skill
    const { data: existingSkill, error: existingError } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_id', skill_id)
      .single()

    if (existingSkill) {
      return createErrorResponse(ApiErrorCode.CONFLICT, 'User already has this skill')
    }

    // Create user skill
    const { data: userSkill, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: user.id,
        skill_id,
        proficiency_level,
        can_teach: can_teach || false,
        can_learn: can_learn !== false, // Default to true
      })
      .select(`
        *,
        skill:skills(*)
      `)
      .single()

    if (error) {
      console.error('Error creating user skill:', error)
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Failed to create user skill')
    }

    return createSuccessResponse(userSkill)
  } catch (error) {
    console.error('POST /api/skills/user error:', error)
    return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'Internal server error')
  }
}
