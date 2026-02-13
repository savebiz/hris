import { Suspense } from "react"
import { Metadata } from "next"
import { getUserDocuments } from "@/app/(protected)/admin/actions"
import { UserDocumentsList } from "@/components/admin/user-documents-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
    title: "User Documents - DataGuard HRIS",
    description: "View confidential documents for an employee",
}

export default async function UserDocumentsPage({ params }: { params: { userId: string } }) {
    const files = await getUserDocuments(params.userId)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Link href="/admin/documents">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Employee Documents</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>File Repository</CardTitle>
                    <CardDescription>
                        Confidential documents uploaded by this user.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading files...</div>}>
                        <UserDocumentsList files={files || []} userId={params.userId} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
