"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, CheckCircle } from "lucide-react"

export function DocumentUpload({ userId }: { userId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, startTransition] = useTransition()
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setUploadStatus("idle")
        }
    }

    const handleUpload = async () => {
        if (!file) return

        startTransition(async () => {
            try {
                const fileExt = file.name.split(".").pop()
                const fileName = `${userId}/${Date.now()}.${fileExt}`

                const { error } = await supabase.storage
                    .from("confidential-docs")
                    .upload(fileName, file)

                if (error) throw error

                setUploadStatus("success")
                setFile(null)
                // Ideally trigger a revalidation or list update here
            } catch (error) {
                console.error("Upload error:", error)
                setUploadStatus("error")
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="document">Upload Document</Label>
                <div className="flex gap-2">
                    <Input id="document" type="file" onChange={handleFileChange} disabled={isUploading} />
                    {file && (
                        <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? (
                    <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                ) : uploadStatus === "success" ? (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Uploaded
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </>
                )}
            </Button>

            {uploadStatus === "error" && (
                <p className="text-sm text-destructive">Failed to upload document. Please try again.</p>
            )}
        </div>
    )
}
