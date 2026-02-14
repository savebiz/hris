'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export type UploadState = {
    success?: boolean
    message?: string
    error?: string
}

export async function uploadPayslip(prevState: UploadState, formData: FormData): Promise<UploadState> {
    const supabase = await createClient()

    // 1. Auth Check (Admin Only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'hr_admin') return { error: "Unauthorized: Admins only" }

    // 2. Extract Data
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)
    const netSalary = parseFloat(formData.get('net_salary') as string)

    if (!file || !userId || !month || !year) return { error: "Missing required fields" }

    // 3. Upload File
    const filePath = `${userId}/${year}_${month}_${file.name}`
    const { error: uploadError } = await supabase.storage
        .from('payslips')
        .upload(filePath, file)

    if (uploadError) {
        console.error("Storage Error:", uploadError)
        return { error: "Failed to upload file" }
    }

    // 4. Create DB Record
    const { error: dbError } = await supabase
        .from('payroll_records')
        .insert({
            user_id: userId,
            month,
            year,
            net_salary: isNaN(netSalary) ? null : netSalary,
            file_path: filePath,
            created_by: user.id
        })

    if (dbError) {
        // Rollback storage if DB fails? For MVP, just error out.
        console.error("DB Error:", dbError)
        return { error: "Failed to create payroll record" }
    }

    // 5. Audit
    await logAction({
        action: 'upload_payslip',
        resourceType: 'payroll',
        resourceId: filePath,
        actorId: user.id,
        details: { month, year, target_user: userId }
    })

    revalidatePath('/admin/payroll')
    return { success: true, message: "Payslip uploaded successfully" }
}

export async function getPayslips(targetUserId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('payroll_records')
        .select(`
            *,
            profiles:user_id (full_name, email)
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

    if (targetUserId) {
        query = query.eq('user_id', targetUserId)
    }

    const { data, error } = await query

    if (error) {
        console.error("Fetch Error:", error)
        return []
    }
    return data
}

export async function getPayslipUrl(path: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Audit view
    await logAction({
        action: 'view_payslip',
        resourceType: 'payroll',
        resourceId: path,
        actorId: user.id
    })

    const { data } = await supabase.storage
        .from('payslips')
        .createSignedUrl(path, 60 * 60) // 1 hour

    return data?.signedUrl
}
