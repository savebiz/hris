import { Suspense } from "react"
import { Metadata } from "next"
import { getLeaveRequests } from "@/app/(protected)/admin/actions"
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
