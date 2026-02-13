import { Suspense } from "react"
import { Metadata } from "next"
import { getStaffList } from "@/app/(protected)/admin/actions"
import { DocumentsUserList } from "@/components/admin/documents-user-list"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Document Repository - DataGuard HRIS",
    description: "Browse documents by employee",
}

export default async function AdminDocumentsPage() {
    // Reuse staff list logic to get users
    const staff = await getStaffList()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Document Repository</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Directories</CardTitle>
                    <CardDescription>
                        Select an employee to view their confidential documents.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading directories...</div>}>
                        <DocumentsUserList data={staff} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
