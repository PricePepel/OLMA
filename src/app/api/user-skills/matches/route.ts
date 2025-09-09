import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // First, get the skills the current user wants to learn
    const { data: userLearningSkills, error: learningError } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        skills (
          id,
          name,
          category,
          description
        )
      `)
      .eq('user_id', user.id)
      .eq('can_learn', true)

    if (learningError) {
      console.error('Error fetching user learning skills:', learningError)
      return NextResponse.json({ error: 'Failed to fetch learning skills' }, { status: 400 })
    }

    if (!userLearningSkills || userLearningSkills.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Extract skill IDs that the user wants to learn
    const skillIds = userLearningSkills
      .filter(us => us.skills) // Filter out any null skills
      .map(us => {
        const skill = Array.isArray(us.skills) ? us.skills[0] : us.skills
        return skill?.id
      })
      .filter(id => id !== undefined)
    
    console.log('User learning skills:', userLearningSkills)
    console.log('Extracted skill IDs:', skillIds)

    if (skillIds.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Find users who can teach these skills (excluding the current user)
    const { data: potentialTeachers, error: teachersError } = await supabase
      .from('user_skills')
      .select(`
        id,
        proficiency_level,
        hourly_rate,
        can_teach,
        user_id,
        skill_id,
        users (
          id,
          full_name,
          username,
          avatar_url,
          location,
          level,
          experience_points
        ),
        skills (
          id,
          name,
          category,
          description
        )
      `)
      .in('skill_id', skillIds)
      .eq('can_teach', true)
      .neq('user_id', user.id) // Exclude current user
      .order('proficiency_level', { ascending: false }) // Sort by highest proficiency first

    if (teachersError) {
      console.error('Error fetching potential teachers:', teachersError)
      return NextResponse.json({ error: 'Failed to fetch potential teachers' }, { status: 400 })
    }

    // Transform the data into the expected format
    const matches = potentialTeachers
      ?.filter(pt => pt.users && pt.skills) // Filter out any null users or skills
      .map(pt => {
        const user = Array.isArray(pt.users) ? pt.users[0] : pt.users
        const skill = Array.isArray(pt.skills) ? pt.skills[0] : pt.skills
        
        return {
          user: {
            id: user?.id,
            full_name: user?.full_name,
            username: user?.username,
            avatar_url: user?.avatar_url,
            location: user?.location,
            level: user?.level,
            experience_points: user?.experience_points
          },
          skill: {
            id: skill?.id,
            name: skill?.name,
            category: skill?.category,
            description: skill?.description
          },
          userSkill: {
            proficiency_level: pt.proficiency_level,
            hourly_rate: pt.hourly_rate,
            can_teach: pt.can_teach
          }
        }
      }) || []

    console.log(`Found ${matches.length} potential teachers for ${skillIds.length} skills`)
    console.log('Potential teachers data:', potentialTeachers)
    console.log('Transformed matches:', matches)

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('GET /api/user-skills/matches error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



