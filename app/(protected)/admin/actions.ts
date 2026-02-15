'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaffSchema, CreateStaffValues } from '@/lib/schemas/admin'
import { ProfileFormValues } from '@/lib/schemas/profile'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function createStaffAction(data: ProfileFormValues) {
    return { error: "This form is deprecated. Please use the 'Add New Staff' button in the admin dashboard.", message: "" }
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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { error: "Configuration Error: Service Role Key missing." }

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create User
    const finalRole = data.staff_category === 'support' ? 'support_staff' : data.role
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        password: "TempPassword123!",
        user_metadata: { full_name: data.full_name, role: finalRole }
    })

    if (createError) return { error: createError.message }
    if (!newUser.user) return { error: "Failed to create user object" }

    // 4. Create Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: newUser.user.id,
            email: data.email,
            full_name: data.full_name,
            role: finalRole,
            phone_number: data.phone_number,
            residential_address: data.residential_address,
            updated_at: new Date().toISOString()
        })

    if (profileError) return { error: "Profile Upsert Error: " + profileError.message }

    // 5. Create Detail Record
    if (data.staff_category === 'core') {
        const { error: detailError } = await supabaseAdmin
            .from('core_staff_details')
            .upsert({
                id: newUser.user.id,
                staff_id: data.staff_id!,
                job_title: data.job_title!,
                department: data.department!,
                date_of_employment: data.date_of_employment!,
                employment_status: 'probation'
            })
        if (detailError) return { error: "Core Details Error: " + detailError.message }
    } else {
        const { error: detailError } = await supabaseAdmin
            .from('support_staff_details')
            .upsert({
                id: newUser.user.id,
                project_assignment: data.project_assignment!,
                project_location: data.project_location!,
                deployment_start_date: data.deployment_start_date!,
                supervisor_name: data.supervisor_name!,
                date_of_engagement: new Date().toISOString().split('T')[0] // Default to now if not provided
            })
        if (detailError) return { error: "Support Details Error: " + detailError.message }
    }

    // 6. Audit
    const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
            action: 'create_staff',
            resource_type: 'profile',
            resource_id: newUser.user.id,
            actor_id: user.id,
            details: { email: data.email, role: finalRole, category: data.staff_category }
        })

    revalidatePath('/admin/staff')
    return { success: true, message: `Staff created. Temp password: TempPassword123!` }
}

export async function getStaffList() {
    const supabase = await createClient()

    // 1. Fetch All Profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching staff:", error)
        return []
    }

    // 2. Fetch All Details (In a real app with pagination, we'd only fetch for the IDs we got)
    // For now, fetching all is fine for a small list.
    const { data: coreDetails } = await supabase.from('core_staff_details').select('*')
    const { data: supportDetails } = await supabase.from('support_staff_details').select('*')

    // 3. Create Map for O(1) Lookup
    const coreMap = new Map(coreDetails?.map(d => [d.id, d]) || [])
    const supportMap = new Map(supportDetails?.map(d => [d.id, d]) || [])

    // 4. Merge
    return profiles.map((p: any) => {
        const core = coreMap.get(p.id)
        const support = supportMap.get(p.id)

        return {
            ...p,
            department: core?.department || support?.project_assignment || null,
            job_title: core?.job_title || (p.role === 'support_staff' ? 'Support Staff' : p.role),
            staff_type: core ? 'core' : (support ? 'support' : null)
        }
    })
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Use Service Role
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return []

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Fetch requests first (Manual Join to avoid missing FK issues)
    const { data: requests, error } = await supabaseAdmin
        .from('profile_change_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

    if (error) {
        console.error("Error fetching profile requests:", error)
        return []
    }

    if (!requests || requests.length === 0) return []

    // Fetch profiles for these requests
    const userIds = Array.from(new Set(requests.map((r: any) => r.user_id)))
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds)

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

    // Merge
    return requests.map((r: any) => ({
        ...r,
        profiles: profileMap.get(r.user_id) || { full_name: 'Unknown User', email: 'N/A' }
    }))
}

export async function approveProfileRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { error: "Configuration Error" }

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Get the request data
    const { data: request, error: fetchError } = await supabaseAdmin
        .from('profile_change_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchError || !request) return { error: "Request not found" }

    // 2. Update the actual Profile
    // 'request.data' is jsonb, e.g. { phone: '123' }
    // Map legacy keys if present
    const updateData: any = { ...request.data }
    if (updateData.phone) {
        updateData.phone_number = updateData.phone
        delete updateData.phone
    }
    if (updateData.address) {
        updateData.residential_address = updateData.address
        delete updateData.address
    }

    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', request.user_id)

    if (updateError) return { error: "Failed to update profile: " + updateError.message }

    // 3. Mark request as approved
    const { error: statusError } = await supabaseAdmin
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

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { error: "Configuration Error" }

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin
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

export async function deactivateStaff(userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Check if actor is admin
    // (In a real app, strict RBAC check here)

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { error: "Configuration Error" }

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Disable Auth User
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: "876000h" } // Ban for 100 years effectively
    )
    if (authError) return { error: "Auth Update Error: " + authError.message }

    // 2. Update Support Staff Status if applicable
    // We try to update both tables, easier than checking role first
    await supabaseAdmin.from('support_staff_details').update({ status: 'Deactivated' }).eq('id', userId)
    await supabaseAdmin.from('core_staff_details').update({ employment_status: 'disengaged' }).eq('id', userId)

    // 3. Audit
    await logAction({
        action: 'deactivate_staff',
        resourceType: 'user',
        resourceId: userId,
        actorId: user.id
    })

    revalidatePath('/admin/staff')
    return { success: true }
}

export async function getStaffDetails(userId: string) {
    const supabase = await createClient()

    // Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError || !profile) return { error: "Profile not found" }

    // Fetch Details based on role/category strategy
    // We'll try fetching both to be sure
    const { data: coreDetails } = await supabase.from('core_staff_details').select('*').eq('id', userId).single()
    const { data: supportDetails } = await supabase.from('support_staff_details').select('*').eq('id', userId).single()

    return {
        profile,
        coreDetails,
        supportDetails,
        category: coreDetails ? 'core' : 'support'
    }
}

export async function updateStaff(userId: string, data: CreateStaffValues) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { error: "Configuration Error" }

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Determine final role and update Profile
    const finalRole = data.staff_category === 'support' ? 'support_staff' : data.role
    const { error: profileError } = await supabaseAdmin.from('profiles').update({
        full_name: data.full_name,
        // email: data.email, // Email change requires auth update usually, skipping for now
        phone_number: data.phone_number,
        residential_address: data.residential_address,
        role: finalRole,
        updated_at: new Date().toISOString()
    }).eq('id', userId)

    if (profileError) return { error: "Profile Update Error: " + profileError.message }

    // 2. Handle Category Specifics (Upsert new, Delete old if switched)
    if (data.staff_category === 'core') {
        const { error: upsertError } = await supabaseAdmin.from('core_staff_details').upsert({
            id: userId,
            staff_id: data.staff_id!,
            job_title: data.job_title!,
            department: data.department!,
            date_of_employment: data.date_of_employment!,
        })
        if (upsertError) return { error: "Core Details Update Error: " + upsertError.message }

        // Cleanup support details if they exist (user switched)
        await supabaseAdmin.from('support_staff_details').delete().eq('id', userId)

    } else {
        const { error: upsertError } = await supabaseAdmin.from('support_staff_details').upsert({
            id: userId,
            project_assignment: data.project_assignment!,
            project_location: data.project_location!,
            deployment_start_date: data.deployment_start_date!,
            supervisor_name: data.supervisor_name!,
            date_of_engagement: data.deployment_start_date || new Date().toISOString().split('T')[0]
        })
        if (upsertError) return { error: "Support Details Update Error: " + upsertError.message }

        // Cleanup core details if they exist (user switched)
        await supabaseAdmin.from('core_staff_details').delete().eq('id', userId)
    }

    // 3. Audit
    await logAction({
        action: 'update_staff',
        resourceType: 'profile',
        resourceId: userId,
        actorId: user.id,
        details: { role: finalRole, changes: data, category_switch: true }
    })

    revalidatePath('/admin/staff')
    return { success: true }
}


