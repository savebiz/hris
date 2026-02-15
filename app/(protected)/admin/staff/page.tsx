import { Suspense } from "react"
import { Metadata } from "next"
import { getStaffList } from "@/app/(protected)/admin/actions"
import { StaffList } from "@/components/admin/staff-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddStaffDialog } from "@/components/admin/add-staff-dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Staff Management - DataGuard HRIS",
    description: "Manage employee profiles and roles",
}

export default async function StaffManagementPage() {
    const staff = await getStaffList()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                        <AddStaffDialog />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>
                        List of all registered staff members (Core & Support).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading staff list...</div>}>
                        <StaffList data={staff} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
