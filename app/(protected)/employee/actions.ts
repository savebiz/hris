'use server'

import { createClient } from '@/lib/supabase/server'
import { LeaveFormValues, leaveSchema } from '@/lib/schemas/leave'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function submitLeaveRequest(data: LeaveFormValues) {
    const supabase = await createClient()

    // Validate data
    const result = leaveSchema.safeParse(data)
    if (!result.success) {
        return { error: "Invalid form data" }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized. Please login." }

    const { error } = await supabase
        .from('leave_requests')
        .insert({
            user_id: user.id,
            leave_type: data.leave_type,
            start_date: data.start_date,
            end_date: data.end_date,
            reason: data.reason,
            status: 'pending'
        })

    if (error) {
        console.error("Leave Request Error:", error)
        return { error: "Failed to submit leave request. Please try again." }
    }

    revalidatePath('/employee/leaves')

    // Log action
    // Note: We don't have the inserted ID returned easily unless we select it.
    // Ideally we should modify insert to select().
    // For now we log without ID or generic.
    await logAction({
        action: 'create',
        resourceType: 'leave_request',
        actorId: user.id,
        details: { type: data.leave_type }
    })

    return { success: true, message: "Leave request submitted successfully" }
}

export async function uploadEmployeeDocument(formData: FormData) {
    const supabase = await createClient()

    const file = formData.get('file') as File
    if (!file) {
        return { error: "No file provided" }
    }

    // specific check for file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return { error: "File size exceeds 5MB limit" }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const filePath = `${user.id}/${Date.now()}_${file.name}`

    const { error } = await supabase
        .storage
        .from('confidential-docs')
        .upload(filePath, file)

    if (error) {
        console.error("Upload Error:", error)
        return { error: "Failed to upload document" }
    }

    revalidatePath('/employee/documents')
    revalidatePath('/employee/dashboard')

    await logAction({
        action: 'upload',
        resourceType: 'document',
        resourceId: filePath,
        actorId: user.id,
        details: { size: file.size }
    })

    return { success: true, message: "Document uploaded successfully" }
}

export async function getMyDocuments() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .storage
        .from('confidential-docs')
        .list(user.id, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        })

    if (error) {
        console.error("Error fetching documents:", error)
        return []
    }

    return data
}

export async function getDocumentUrl(path: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Security check: ensure the path starts with the user's ID
    if (!path.startsWith(user.id)) {
        console.error("Unauthorized access attempt to document:", path)
        return null
    }

    const { data, error } = await supabase
        .storage
        .from('confidential-docs')
        .createSignedUrl(path, 60 * 60) // 1 hour

    if (error) {
        console.error("Error creating signed URL:", error)
        return null
    }

    // Log view
    logAction({
        action: 'view',
        resourceType: 'document',
        resourceId: path,
        actorId: user.id
    })

    return data.signedUrl
}
