'use server'

import { createClient } from '@/lib/supabase/server'
import { LeaveFormValues, leaveSchema } from '@/lib/schemas/leave'
import { revalidatePath } from 'next/cache'

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
    return { success: true, message: "Leave request submitted successfully" }
}
