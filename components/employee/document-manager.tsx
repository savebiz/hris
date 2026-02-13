"use client"

import { useState, useTransition, useRef } from "react"
import { uploadEmployeeDocument } from "@/app/(protected)/employee/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, File as FileIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentManagerProps {
    initialDocuments: any[]
}

export function DocumentManager({ initialDocuments }: DocumentManagerProps) {
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
                                            <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-md">{doc.name.split('_').slice(1).join('_')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(doc.created_at).toLocaleDateString()} • {(doc.metadata?.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" disabled>
                                        View (Restricted)
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
