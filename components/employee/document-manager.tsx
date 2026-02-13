"use client"

import { useState, useTransition, useRef } from "react"
import { uploadEmployeeDocument, getDocumentUrl } from "@/app/(protected)/employee/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, File as FileIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentManagerProps {
    initialDocuments: any[]
    userId: string
}

export function DocumentManager({ initialDocuments, userId }: DocumentManagerProps) {
    const [isPending, startTransition] = useTransition()
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    const handleUpload = (formData: FormData) => {
        setUploadStatus(null)
        startTransition(async () => {
            const result = await uploadEmployeeDocument(formData)
            if (result.error) {
                setUploadStatus({ type: 'error', message: result.error })
            } else {
                setUploadStatus({ type: 'success', message: result.message || "File uploaded!" })
                formRef.current?.reset()
            }
        })
    }

    const handleView = async (fileName: string, userId: string) => {
        // userId is embedded in the path logic in the server action, 
        // but for the client we need to construct the path IF the action expects a full path.
        // Wait, the action `getDocumentUrl` in `employee/actions.ts` expects `path`.
        // The file name in `initialDocuments` is just the name. 
        // The path in storage is `userId/filename`.
        // BUT `initialDocuments` returned by `list(userId)` usually has `name` as just the filename.
        // We need the user ID to construct the path. 
        // `initialDocuments` doesn't strictly have the userId in the file object locally unless we pass it.
        // However, the `getDocumentUrl` action gets the current user from auth(), 
        // so we just need to pass the path relative to the bucket or fully qualified?
        // `storage.from(...).createSignedUrl(path)` expects the path inside the bucket.
        // Since we organize by `userId/filename`, we need to know the userId.
        // We can pass `userId` as prop to `DocumentManager` OR better, 
        // since `getDocumentUrl` checks `auth.uid()`, maybe we can just pass the filename and let the server prepend it?
        // NO, the server action `getDocumentUrl(path)` checks `if (!path.startsWith(user.id))`. 
        // So the CLIENT must send `userId/filename`.
        // We need to pass `userId` to `DocumentManager`.
        // I'll update the component to accept `userId`.
        //
        // Wait, let's look at `getDocumentUrl` implementation again.
        // It checks `!path.startsWith(user.id)`.
        // So I need to send `${user.id}/${fileName}`.
        // I need `userId` in props.
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Document</CardTitle>
                    <CardDescription>Upload payslips, contracts, or other HR documents (Max 5MB).</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleUpload} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input type="file" name="file" required className="flex-1" accept=".pdf,.doc,.docx,.jpg,.png" />
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {uploadStatus && (
                        <div className={`mt-4 p-4 rounded-md flex items-center gap-2 ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {uploadStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <span className="text-sm font-medium">{uploadStatus.message}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
                <CardHeader>
                    <CardTitle>My Documents</CardTitle>
                    <CardDescription>Manage your uploaded files.</CardDescription>
                </CardHeader>
                <CardContent>
                    {initialDocuments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <p>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {initialDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-md">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-md">
                                                {doc.name.includes('_') && /^\d+$/.test(doc.name.split('_')[0])
                                                    ? doc.name.split('_').slice(1).join('_')
                                                    : doc.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown'} • {doc.metadata ? (doc.metadata.size / 1024).toFixed(1) : 0} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={async () => {
                                        const path = `${userId}/${doc.name}`
                                        const url = await getDocumentUrl(path)
                                        if (url) window.open(url, '_blank')
                                        else alert("Failed to open document")
                                    }}>
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
