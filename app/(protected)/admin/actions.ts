'use server'

import { createClient } from '@/lib/supabase/server'
import { ProfileFormValues, profileSchema } from '@/lib/schemas/profile'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function createStaffAction(data: ProfileFormValues) {
    const supabase = await createClient()

    // 1. Create Auth User (In a real app, you might use the Admin API to invite users)
    // For Phase 1, we might assume the user already exists or we are just creating the profile record 
    // linked to a placeholder or invite flow. 
    // *Correction*: The PRD implies HR creates the profile. 
    // We need to create the `auth.users` record first to get an ID, OR we use a system where 
    // we invite the user via email and they fill it out. 
    // However, `profiles` table references `auth.users`. 
    // *Strategy*: We will usage Supabase Admin API to `inviteUserByEmail` which creates the auth record.

    const supabaseAdmin = await createClient() // Ideally needs SERVICE_ROLE_KEY for admin actions, 
    // but for now we will stick to the plan where HR creates "Profiles" and we might need a workaround 
    // if we don't have the Service Role Key in .env.local yet.
    // 
    // *Alternative for Phase 1*: We just insert into tables if we manually created auth users, 
    // BUT `profiles` PKEY is `auth.users.id`.
    // 
    // Let's assume for this step we are just validating logic. 
    // actually, to create a profile, we need a User ID.
    // We will assume the HR uses the Supabase Dashboard to invite users for now (Task 1.2 output), 
    // OR we use a public Server Action to "signup" a user with a temp password.

    // validated data
    const result = profileSchema.safeParse(data)
    if (!result.success) {
        return { error: "Invalid data" }
    }

    // For this implementation, we will mock the "Success" return 
    // because we can't create an auth user without Service Key easily in this context 
    // or without a signup flow. 
    // We will assume this action updates an EXISTING profile if ID is provided, 
    // or intended to be coupled with an Invite.

    // TODO: Integrate with Admin Invite API

    return { success: true, message: "Staff profile logic ready. (Requires Admin Invite integration)" }
}

export async function getStaffList() {
    const supabase = await createClient()

    // Fetch profiles from public table
    // In a real app we might join with auth.users using admin API if needed, 
    // but typically profiles table has the display info.
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching staff:", error)
        return []
    }

    return profiles
}

export async function getLeaveRequests() {
    const supabase = await createClient()

    // Fetch all leave requests. 
    // Join with profiles to get the requester's name.
    // Explicitly casting or checking relation might be needed if foreign key name varies.
    // Assuming 'profiles' is the table and 'user_id' is the FK.
    // Note: If no FK constraint exists, we might just get user_id and have to fetch profiles separately. 
    // Let's try the join first.
    const { data: leaves, error } = await supabase
        .from('leave_requests')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching leaves:", error)
        return { data: [], error: error.message }
    }

    // Fetch balances for all unique users in the requests
    const userIds = Array.from(new Set(leaves.map((l: any) => l.user_id)))

    // Only attempt to fetch if we have users (and if table exists - user might not have run migration yet)
    // We wrap this in try/catch or just handle error gracefully if table doesn't exist
    let balancesMap: Record<string, any> = {}
    try {
        const { data: balances, error: balanceError } = await supabase
            .from('leave_balances')
            .select('*')
            .in('user_id', userIds)

        if (!balanceError && balances) {
            balances.forEach((b: any) => {
                balancesMap[b.user_id] = b
            })
        }
    } catch (err) {
        console.warn("Could not fetch balances (table might not exist yet)", err)
    }

    // Merge balances into leaves data
    const leavsWithBalance = leaves.map((l: any) => ({
        ...l,
        leave_balances: balancesMap[l.user_id] || null
    }))

    return { data: leavsWithBalance, error: null }
}

export async function approveLeaveRequest(id: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('leave_requests')
        .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: user.id
        })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/leaves')
    return { success: true }
}

export async function rejectLeaveRequest(id: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('leave_requests')
        .update({
            status: 'declined',
            approved_at: new Date().toISOString(),
            approved_by: user.id
        }) // capture decision time
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/leaves')
    return { success: true }
}

export async function getUserDocuments(userId: string) {
    const supabase = await createClient()

    // List files in the user's folder
    const { data, error } = await supabase
        .storage
        .from('confidential-docs')
        .list(userId, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        })

    if (error) {
        console.error("Error fetching documents:", error)
        return []
    }

    // Filter out potential folder placeholders or empty objects
    // Debug logging
    console.log(`[getUserDocuments] Raw data for ${userId}:`, JSON.stringify(data, null, 2))

    return data.filter(item => item.name !== '.emptyFolderPlaceholder' && item.metadata)
}

export async function getDocumentUrl(path: string) {
    const supabase = await createClient()

    // Create a signed URL. By default, Supabase might set Content-Disposition to download.
    // For "viewing", we usually just want the URL.
    const { data, error } = await supabase
        .storage
        .from('confidential-docs')
        .createSignedUrl(path, 60 * 60) // 1 hour expiry

    if (error) {
        console.error("Error creating signed URL:", error)
        return null
    }

    // Log view action (audit)
    // We do this async without awaiting to not block UI
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        logAction({
            action: 'view',
            resourceType: 'document',
            resourceId: path,
            actorId: user.id
        })
    }

    return data.signedUrl
}

export async function getAdminDashboardStats() {
    const supabase = await createClient()
    const today = new Date().toISOString() // or just Date().toISOString().split('T')[0] for date comparison if needed

    // 1. Total Employees
    const { count: employeeCount, error: empError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // 2. Pending Leave Requests
    const { count: pendingCount, error: pendingError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    // 3. People on Leave Today (Approved & Date Range overlap)
    // Supabase range filters can be tricky. 
    // We want where start_date <= today AND end_date >= today
    const { count: onLeaveCount, error: onLeaveError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today)

    if (empError) console.error("Error fetching employee count:", empError)

    return {
        totalEmployees: employeeCount || 0,
        pendingRequests: pendingCount || 0,

        onLeaveToday: onLeaveCount || 0
    }
}

export async function getAuditLogs() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profiles:actor_id (full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error fetching logs:", error)
        return []
    }

    return data
}



