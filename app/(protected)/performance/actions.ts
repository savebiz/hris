'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Cycle = {
    id: string
    title: string
    status: 'draft' | 'active' | 'review' | 'closed'
    start_date: string
    end_date: string
}

export type Goal = {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    progress: number
    cycle_id: string
    created_at: string
}

export type GoalState = {
    success?: boolean
    message?: string
    error?: string
}

// --- Cycles ---

export async function createCycle(prevState: any, formData: FormData): Promise<GoalState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Auth Check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
    if (profile?.role !== 'hr_admin') return { error: "Unauthorized" }

    const title = formData.get('title') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const status = formData.get('status') as string || 'draft'

    const { error } = await supabase.from('performance_cycles').insert({
        title,
        start_date: startDate,
        end_date: endDate,
        status,
        created_by: user?.id
    })

    if (error) return { error: "Failed to create cycle" }

    revalidatePath('/admin/performance')
    return { success: true, message: "Cycle created" }
}

export async function getCycles(isAdmin = false) {
    const supabase = await createClient()
    let query = supabase.from('performance_cycles').select('*').order('start_date', { ascending: false })

    if (!isAdmin) {
        query = query.in('status', ['active', 'review'])
    }

    const { data } = await query
    return data as Cycle[]
}

// --- Goals ---

export async function createGoal(prevState: any, formData: FormData): Promise<GoalState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const title = formData.get('title') as string
    const cycleId = formData.get('cycle_id') as string
    const description = formData.get('description') as string

    const { error } = await supabase.from('performance_goals').insert({
        user_id: user.id,
        cycle_id: cycleId,
        title,
        description
    })

    if (error) return { error: "Failed to create goal" }

    revalidatePath('/employee/performance')
    return { success: true, message: "Goal added" }
}

export async function getMyGoals(cycleId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase.from('performance_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

    if (cycleId) {
        query = query.eq('cycle_id', cycleId)
    }

    const { data } = await query
    return data as Goal[]
}

export async function updateGoal(goalId: string, progress: number, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from('performance_goals')
        .update({ progress, status, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .eq('user_id', user.id)

    if (error) return { error: "Failed to update goal" }

    revalidatePath('/employee/performance')
    return { success: true }
}

export async function getTeamGoals() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Get Team Members
    const { data: team } = await supabase.from('profiles').select('id').eq('manager_id', user.id)
    if (!team || team.length === 0) return []

    const teamIds = team.map(t => t.id)

    // 2. Get Goals
    const { data: goals, error } = await supabase
        .from('performance_goals')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url, job_title)
        `)
        .in('user_id', teamIds)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching team goals:", error)
        return []
    }

    return goals as (Goal & { profiles: any })[]
}
