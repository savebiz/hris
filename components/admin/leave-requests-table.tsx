"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { approveLeaveRequest, rejectLeaveRequest } from "@/app/(protected)/admin/actions"
import { useTransition } from "react"
import { toast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

function calculateDuration(startDate: string, endDate: string) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} days`
    } catch (e) {
        return "N/A"
    }
}

function getBalanceDisplay(request: any) {
    const balances = request.leave_balances
    if (!balances) return "N/A"

    const type = request.leave_type?.toLowerCase() || ""
    if (type.includes("annual")) {
        return `${balances.annual_total - balances.annual_used}/${balances.annual_total}`
    }
    if (type.includes("sick")) {
        return `${balances.sick_total - balances.sick_used}/${balances.sick_total}`
    }
    if (type.includes("casual")) {
        return `${balances.casual_total - balances.casual_used}/${balances.casual_total}`
    }
    return "N/A"
}

interface LeaveRequest {
    id: string
    user_id: string
    leave_type: string // 'annual' | 'sick' | 'casual'
    start_date: string
    end_date: string
    reason: string | null
    status: 'pending' | 'approved' | 'declined'
    profiles?: {
        full_name: string | null
        avatar_url: string | null
        job_title: string | null
    } | null
}

interface LeaveRequestsTableProps {
    data: LeaveRequest[]
}

export function LeaveRequestsTable({ data }: LeaveRequestsTableProps) {
    const [isPending, startTransition] = useTransition()
    const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'approve' | 'reject' } | null>(null)

    const handleAction = () => {
        if (!confirmAction) return

        startTransition(async () => {
            let result
            if (confirmAction.type === 'approve') {
                result = await approveLeaveRequest(confirmAction.id)
            } else {
                result = await rejectLeaveRequest(confirmAction.id)
            }

            if (result.error) {
                alert(`Error ${confirmAction.type === 'approve' ? 'approving' : 'declining'} leave: ${result.error}`)
            }
            setConfirmAction(null)
        })
    }

    if (!data.length) {
        return <div className="p-4 text-center text-muted-foreground">No leave requests found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((request) => (
                    <TableRow key={request.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={request.profiles?.avatar_url || ""} />
                                    <AvatarFallback>{request.profiles?.full_name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{request.profiles?.full_name || "Unknown"}</span>
                                    {/* <span className="text-xs text-muted-foreground">{request.profiles?.job_title}</span> */}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="capitalize">{request.leave_type} Leave</TableCell>
                        <TableCell>{calculateDuration(request.start_date, request.end_date)}</TableCell>
                        <TableCell>{getBalanceDisplay(request)}</TableCell>
                        <TableCell className="text-sm">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {request.reason || "-"}
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                request.status === 'approved' ? "success" :
                                    request.status === 'declined' ? "destructive" :
                                        "warning"
                            }>
                                {request.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {request.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => setConfirmAction({ id: request.id, type: 'approve' })} disabled={isPending}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setConfirmAction({ id: request.id, type: 'reject' })} disabled={isPending}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. You are about to <strong>{confirmAction?.type === 'approve' ? 'approve' : 'decline'}</strong> this leave request.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            className={confirmAction?.type === 'approve' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {confirmAction?.type === 'approve' ? 'Approve' : 'Decline'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Table>
    )
}
