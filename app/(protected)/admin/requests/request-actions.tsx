'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import { approveProfileRequest, rejectProfileRequest } from "../actions"
import { useToast } from "@/hooks/use-toast"

export function RequestActions({ requestId }: { requestId: string }) {
    const { toast } = useToast()
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

    const handleApprove = async () => {
        setLoading('approve')
        try {
            const result = await approveProfileRequest(requestId)
            if (result.success) {
                toast({
                    title: "Request Approved",
                    description: "The profile has been updated successfully.",
                    variant: "default",
                    className: "bg-green-600 text-white border-none"
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to approve request.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setLoading(null)
        }
    }

    const handleReject = async () => {
        setLoading('reject')
        try {
            const result = await rejectProfileRequest(requestId)
            if (result.success) {
                toast({
                    title: "Request Rejected",
                    description: "The request has been rejected.",
                    variant: "default"
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to reject request.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex items-end justify-end gap-3 h-full">
            <Button
                onClick={handleApprove}
                disabled={!!loading}
                className="bg-green-600 hover:bg-green-700"
            >
                {loading === 'approve' ? (
                    "Approving..."
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Update
                    </>
                )}
            </Button>

            <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!!loading}
            >
                {loading === 'reject' ? (
                    "Rejecting..."
                ) : (
                    <>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </>
                )}
            </Button>
        </div>
    )
}
