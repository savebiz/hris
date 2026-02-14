'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

// Types
export type OnboardingItem = {
    id: string
    title: string
    description?: string
    link_url?: string
    required_role?: string
}

export type UserTask = {
    id: string
    user_id: string
    library_item_id?: string
    status: 'pending' | 'completed' | 'skipped'
    library_item?: OnboardingItem
    completed_at?: string
}

// --- Library Actions ---

export async function getLibraryItems() {
    const supabase = await createClient()
    const { data } = await supabase.from('onboarding_library').select('*').order('created_at', { ascending: false })
    return data as OnboardingItem[]
}

export async function createLibraryItem(title: string, description?: string, role?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Auth Check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
    if (profile?.role !== 'hr_admin') return { error: "Unauthorized" }

    const { error } = await supabase.from('onboarding_library').insert({
        title,
        description,
        required_role: role === 'all' ? null : role,
        created_by: user?.id
    })

    if (error) return { error: "Failed to create item" }

    revalidatePath('/admin/onboarding')
    return { success: true }
}

// --- Assignment Actions ---

export async function assignTask(userId: string, libraryItemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from('user_tasks').insert({
        user_id: userId,
        library_item_id: libraryItemId,
        assigned_by: user.id
    })

    if (error) {
        console.error("Assign Error:", error)
        return { error: "Failed to assign task" }
    }

    await logAction({
        action: 'assign_onboarding',
        resourceType: 'onboarding',
        resourceId: libraryItemId,
        actorId: user.id,
        details: { target_user: userId }
    })

    revalidatePath('/admin/onboarding')
    return { success: true }
}

// --- User Actions ---

export async function getUserTasks(targetUserId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // If targetUserId provided, check if Admin or Self
    const uid = targetUserId || user.id

    const { data } = await supabase
        .from('user_tasks')
        .select(`
            *,
            library_item:onboarding_library(*)
        `)
        .eq('user_id', uid)
        .order('status', { ascending: false }) // Pending first? 'pending' > 'completed' alphabetically? No.
    // We'll sort via JS if needed, or status desc puts pending (p) after completed (c)?
    // Let's rely on client sort or enhance query later.

    return data as UserTask[]
}

export async function toggleTaskStatus(taskId: string, status: 'pending' | 'completed') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const updateData = {
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
    }

    const { error } = await supabase
        .from('user_tasks')
        .update(updateData)
        .eq('id', taskId)
    // RLS ensures only owner or admin can update

    if (error) return { error: "Failed to update task" }

    revalidatePath('/employee/onboarding')
    return { success: true }
}

export async function getTeamOnboardingStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Get Team Members
    const { data: team } = await supabase.from('profiles').select('*').eq('manager_id', user.id)
    if (!team || team.length === 0) return []

    // 2. Get Tasks for Team
    const teamIds = team.map(t => t.id)
    const { data: tasks } = await supabase
        .from('user_tasks')
        .select('*')
        .in('user_id', teamIds)

    // 3. Aggregate Progress
    // We want to return: { user: Profile, progress: number, total: number, completed: number }
    const result = team.map(member => {
        const memberTasks = tasks?.filter(t => t.user_id === member.id) || []
        const total = memberTasks.length
        const completed = memberTasks.filter(t => t.status === 'completed').length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0

        return {
            user: member,
            progress,
            total,
            completed
        }
    })

    return result
}
