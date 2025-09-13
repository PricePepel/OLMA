import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthenticatedUser, 
  errorHandlers
} from '@/lib/api-helpers'
import { ApiErrorCode } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    const activities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      icon: string;
      metadata?: {
        club_name?: string;
        event_title?: string;
        achievement_name?: string;
        points?: number;
      };
    }> = []

    // Get recent messages
    const { data: recentMessages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        conversation_id,
        sender:users!messages_sender_id_fkey (
          full_name,
          username
        )
      `)
      .or(`sender_id.eq.${user.id},conversation_id.in.(
        select id from conversations where user1_id = '${user.id}' or user2_id = '${user.id}'
      )`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!messagesError && recentMessages) {
      recentMessages.forEach(message => {
        const isOwnMessage = message.sender_id === user.id
        const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender
        activities.push({
          id: `message-${message.id}`,
          type: isOwnMessage ? 'message_sent' : 'message_received',
          title: isOwnMessage ? 'Message sent' : `New message from ${sender?.full_name || 'Unknown'}`,
          description: message.content,
          timestamp: message.created_at,
          icon: 'message'
        })
      })
    }

    // Get recent meeting invitations
    const { data: recentMeetings, error: meetingsError } = await supabase
      .from('meeting_invitations')
      .select(`
        id,
        status,
        created_at,
        inviter_id,
        invitee_id,
        inviter:users!meeting_invitations_inviter_id_fkey (
          full_name,
          username
        ),
        invitee:users!meeting_invitations_invitee_id_fkey (
          full_name,
          username
        ),
        skill:skills (
          name
        )
      `)
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!meetingsError && recentMeetings) {
      recentMeetings.forEach(meeting => {
        const isInviter = meeting.inviter_id === user.id
        const invitee = Array.isArray(meeting.invitee) ? meeting.invitee[0] : meeting.invitee
        const inviter = Array.isArray(meeting.inviter) ? meeting.inviter[0] : meeting.inviter
        const otherUser = isInviter ? invitee : inviter
        
        let title = ''
        let description = ''
        
        const skill = Array.isArray(meeting.skill) ? meeting.skill[0] : meeting.skill
        
        switch (meeting.status) {
          case 'pending':
            title = isInviter ? 'Meeting invitation sent' : 'New meeting invitation'
            description = `${skill?.name || 'Unknown skill'} with ${otherUser?.full_name || 'Unknown user'}`
            break
          case 'accepted':
            title = 'Meeting accepted'
            description = `${skill?.name || 'Unknown skill'} with ${otherUser?.full_name || 'Unknown user'}`
            break
          case 'denied':
            title = 'Meeting declined'
            description = `${skill?.name || 'Unknown skill'} with ${otherUser?.full_name || 'Unknown user'}`
            break
          case 'started':
            title = 'Meeting started'
            description = `${skill?.name || 'Unknown skill'} with ${otherUser?.full_name || 'Unknown user'}`
            break
          case 'completed':
            title = 'Meeting completed'
            description = `${skill?.name || 'Unknown skill'} with ${otherUser?.full_name || 'Unknown user'}`
            break
        }

        activities.push({
          id: `meeting-${meeting.id}`,
          type: `meeting_${meeting.status}`,
          title,
          description,
          timestamp: meeting.created_at,
          icon: 'calendar'
        })
      })
    }

    // Get recent skill additions
    const { data: recentSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        id,
        can_teach,
        can_learn,
        proficiency_level,
        created_at,
        skills (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!skillsError && recentSkills) {
      recentSkills.forEach(skill => {
        const action = skill.can_teach ? 'teaching' : 'learning'
        const skillData = Array.isArray(skill.skills) ? skill.skills[0] : skill.skills
        activities.push({
          id: `skill-${skill.id}`,
          type: 'skill_added',
          title: `Skill added`,
          description: `Added ${skillData?.name || 'Unknown skill'} for ${action} (Level ${skill.proficiency_level})`,
          timestamp: skill.created_at,
          icon: 'book'
        })
      })
    }

    // Get recent posts
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        club_id,
        clubs (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!postsError && recentPosts) {
      recentPosts.forEach(post => {
        const clubData = Array.isArray(post.clubs) ? post.clubs[0] : post.clubs
        const clubName = clubData?.name || 'General'
        const contentPreview = post.content.length > 100 
          ? post.content.substring(0, 100) + '...' 
          : post.content

        activities.push({
          id: `post-${post.id}`,
          type: 'post_created',
          title: 'Post created',
          description: contentPreview,
          timestamp: post.created_at,
          icon: 'message',
          metadata: {
            club_name: clubName
          }
        })
      })
    }

    // Get recent club memberships
    const { data: recentClubs, error: clubsError } = await supabase
      .from('club_members')
      .select(`
        id,
        role,
        joined_at,
        clubs (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(5)

    if (!clubsError && recentClubs) {
      recentClubs.forEach(membership => {
        const clubData = Array.isArray(membership.clubs) ? membership.clubs[0] : membership.clubs
        
        activities.push({
          id: `club-${membership.id}`,
          type: 'club_joined',
          title: 'Joined club',
          description: `Became a ${membership.role} of ${clubData?.name || 'Unknown club'}`,
          timestamp: membership.joined_at,
          icon: 'building',
          metadata: {
            club_name: clubData?.name
          }
        })
      })
    }

    // Get recent event attendance
    const { data: recentEvents, error: eventsError } = await supabase
      .from('event_attendees')
      .select(`
        id,
        status,
        created_at,
        events (
          title,
          start_time
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!eventsError && recentEvents) {
      recentEvents.forEach(attendance => {
        const eventData = Array.isArray(attendance.events) ? attendance.events[0] : attendance.events
        
        activities.push({
          id: `event-${attendance.id}`,
          type: 'event_attended',
          title: 'Event attendance',
          description: `${attendance.status} attendance for ${eventData?.title || 'Unknown event'}`,
          timestamp: attendance.created_at,
          icon: 'calendar',
          metadata: {
            event_title: eventData?.title
          }
        })
      })
    }

    // Sort all activities by timestamp and limit to 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return createSuccessResponse(sortedActivities)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return errorHandlers.unauthorized()
      }
      return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, error.message)
    }
    return errorHandlers.internalError(error)
  }
}


