'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function getManagerDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { teamCount: 0, pendingReview: 0 }

    // 1. Team Count
    const { count: teamCount, error: teamError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('manager_id', user.id)

    // 2. Pending Review (Status = 'pending_manager')
    // We need to find leaves where user_id is in my team
    // But since we have RLS "Managers can view team leaves", we can just query relevant status?
    // Wait, the RLS policy relies on the JOIN. 
    // Let's rely on the RLS. 
    const { count: pendingCount, error: pendingError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_manager')
    // The RLS should filter for only "my team's leaves" automatically 
    // IF the query runs in a context where RLS checks against auth.uid().
    // Yes, server client with user session does that.

    if (teamError) console.error("Manager Stats Error:", teamError)

    return {
        teamCount: teamCount || 0,
        pendingReview: pendingCount || 0
    }
}

export async function getTeamLeaves() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('leave_requests')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url, job_title)
        `)
        .eq('status', 'pending_manager')
        .order('created_at', { ascending: true })

    if (error) {
        console.error("Error fetching team leaves:", error)
        return []
    }
    return data
}

export async function getMyTeam() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', user.id)

    if (error) return []
    return data
}

export async function approveLeaveManager(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Update status to 'pending' (which means Pending HR)
    // We assume 'pending' is the state HR sees.
    const { error } = await supabase
        .from('leave_requests')
        .update({
            status: 'pending', // Forward to HR
            manager_approval_date: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) return { error: error.message }

    revalidatePath('/manager/dashboard')

    await logAction({
        action: 'approve_manager',
        resourceType: 'leave_request',
        resourceId: requestId,
        actorId: user.id
    })

    return { success: true }
}

export async function rejectLeaveManager(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('leave_requests')
        .update({
            status: 'declined', // Final rejection
            manager_approval_date: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) return { error: error.message }

    revalidatePath('/manager/dashboard')

    await logAction({
        action: 'reject_manager',
        resourceType: 'leave_request',
        resourceId: requestId,
        actorId: user.id
    })

    return { success: true }
}
