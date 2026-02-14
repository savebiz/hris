'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { getPayslipUrl } from "@/app/(protected)/payroll/actions"

export function PayslipDownloadButton({ path, filename }: { path: string, filename: string }) {
    const handleDownload = async () => {
        const url = await getPayslipUrl(path)
        if (url) {
            window.open(url, '_blank')
        } else {
            alert("Failed to get download link")
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download
        </Button>
    )
}
