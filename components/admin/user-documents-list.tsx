"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import { getDocumentUrl } from "@/app/(protected)/admin/actions"

interface FileObject {
    name: string
    id: string
    updated_at: string
    created_at: string
    last_accessed_at: string
    metadata: Record<string, any>
}

interface UserDocumentsListProps {
    files: FileObject[]
    userId: string
}

export function UserDocumentsList({ files, userId }: UserDocumentsListProps) {
    if (!files.length) {
        return <div className="p-4 text-center text-muted-foreground">No documents found for this user.</div>
    }

    const handleDownload = async (fileName: string) => {
        const path = `${userId}/${fileName}`
        const signedUrl = await getDocumentUrl(path)
        if (signedUrl) {
            window.open(signedUrl, '_blank')
        } else {
            alert("Failed to get download URL")
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.map((file) => (
                    <TableRow key={file.id}>
                        <TableCell>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">{file.name}</TableCell>
                        <TableCell>{(file.metadata?.size / 1024).toFixed(1)} KB</TableCell>
                        <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(file.name)}>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
