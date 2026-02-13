import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { LeaveRequestForm } from "@/components/forms/leave/leave-form"
import { LeaveHistory } from "@/components/leaves/leave-history"

export const metadata: Metadata = {
    title: "Leave Management - DataGuard HRIS",
    description: "Request and view leave history.",
}

export default async function LeavePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch leaves
    const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-3">
                    <LeaveRequestForm />
                </div>
                <div className="col-span-4">
                    <LeaveHistory leaves={leaves || []} />
                </div>
            </div>
        </div>
    )
}
