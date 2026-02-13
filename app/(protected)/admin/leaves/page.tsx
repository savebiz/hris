import { Suspense } from "react"
import { Metadata } from "next"
import { getLeaveRequests } from "@/app/(protected)/admin/actions"
import { createClient } from "@/lib/supabase/server"
import { LeaveRequestsTable } from "@/components/admin/leave-requests-table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Leave Management - DataGuard HRIS",
    description: "Approve or reject leave requests",
}

export default async function LeaveManagementPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    // Check if user is authorized to view requests locally to provide better feedback
    // (Actual RLS will block data regardless, but this tells them WHY)
    if (profile?.role !== 'hr_admin') {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Access Restricted</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Your user account (<span className="font-mono">{user?.email}</span>) has the role <strong>{profile?.role || 'unknown'}</strong>.</p>
                                <p className="mt-2">Leave requests are protected by Security Policies (RLS) and are only visible to <strong>hr_admin</strong> role.</p>
                                <p className="mt-2">To fix this, please run the SQL script located in <code>supabase/promote_admin.sql</code> in your Supabase Dashboard.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const leaves = await getLeaveRequests()
    const pendingCount = leaves.filter((l: any) => l.status === 'pending').length

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Request History</CardTitle>
                    <CardDescription>
                        Manage staff leave applications.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading requests...</div>}>
                        <LeaveRequestsTable data={leaves} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
