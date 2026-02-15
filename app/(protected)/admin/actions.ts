'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaffSchema, CreateStaffValues } from '@/lib/schemas/admin'
import { ProfileFormValues } from '@/lib/schemas/profile'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function createStaffAction(data: ProfileFormValues) {
    return { error: "This form is deprecated. Please use the 'Add New Staff' button in the admin dashboard." }
}


export async function createStaff(data: CreateStaffValues) {
    const supabase = await createClient()

    // 1. Validate Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 2. Validate Input
    const result = createStaffSchema.safeParse(data)
    if (!result.success) {
        return { error: "Invalid data: " + result.error.issues[0].message }
    }

    // 3. Create Auth User (Requires Service Role Key)
    // We try to create a client with the Service Role Key if available.
    // If not, we cannot create an auth user server-side without an Invite flow.
    // For this environment, we'll try to check if we can simply insert into profiles
    // assuming the trigger handles it OR fail gracefully.

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
        return { error: "Server configuration error: Missing Service Role Key. cannot create users." }
    }

    // Create Admin Client
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // Create User
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true, // Auto-confirm
        password: "TempPassword123!", // Temp password
        user_metadata: {
            full_name: data.full_name,
            role: data.role // This might be used by triggers
        }
    })

    if (createError) {
        console.error("Create User Error:", createError)
        return { error: createError.message }
    }

    if (!newUser.user) return { error: "Failed to create user object" }

    // 4. Update/Create Profile
    // The trigger might have created the profile already.
    // We should update it with the extra details.
    // We'll upsert to be safe.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: newUser.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            department: data.department,
            job_title: data.job_title,
            updated_at: new Date().toISOString()
        })

    if (profileError) {
        console.error("Profile Upsert Error:", profileError)
        // Check if user was created but profile failed?
        return { error: "User created but profile update failed: " + profileError.message }
    }

    // 5. Audit
    const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
            action: 'create_staff',
            resource_type: 'profile',
            resource_id: newUser.user.id,
            actor_id: user.id,
            details: { email: data.email, role: data.role }
        })

    revalidatePath('/admin/staff')
    return { success: true, message: `Staff created. Temp password: TempPassword123!` }
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

export async function getProfileRequests() {
    const supabase = await createClient()

    // Join with profiles to know WHO is requesting
    const { data, error } = await supabase
        .from('profile_change_requests')
        .select(`
            *,
            profiles:user_id (id, full_name, email, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

    if (error) {
        console.error("Error fetching profile requests:", error)
        return []
    }
    return data
}

export async function approveProfileRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 1. Get the request data
    const { data: request, error: fetchError } = await supabase
        .from('profile_change_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchError || !request) return { error: "Request not found" }

    // 2. Update the actual Profile
    // 'request.data' is jsonb, e.g. { phone: '123' }
    const { error: updateError } = await supabase
        .from('profiles')
        .update(request.data)
        .eq('id', request.user_id)

    if (updateError) return { error: "Failed to update profile: " + updateError.message }

    // 3. Mark request as approved
    const { error: statusError } = await supabase
        .from('profile_change_requests')
        .update({ status: 'approved', admin_comment: 'Approved by ' + user.email })
        .eq('id', requestId)

    // 4. Log audit
    await logAction({
        action: 'approve_profile_update',
        resourceType: 'profile',
        resourceId: request.user_id,
        actorId: user.id,
        details: request.data
    })

    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/requests')
    return { success: true }
}

export async function rejectProfileRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('profile_change_requests')
        .update({ status: 'rejected', admin_comment: 'Rejected by ' + user.email })
        .eq('id', requestId)

    if (error) return { error: error.message }

    await logAction({
        action: 'reject_profile_update',
        resourceType: 'profile_change_request',
        resourceId: requestId,
        actorId: user.id
    })

    revalidatePath('/admin/requests')
    return { success: true }
}



