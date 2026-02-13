import { Metadata } from "next"
import { getMyDocuments } from "../actions"
import { DocumentManager } from "@/components/employee/document-manager"

export const metadata: Metadata = {
    title: "My Documents - DataGuard HRIS",
    description: "Manage your personnel documents",
}

export default async function DocumentsPage() {
    const documents = await getMyDocuments()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
            </div>

            <DocumentManager initialDocuments={documents} />
        </div>
    )
}
