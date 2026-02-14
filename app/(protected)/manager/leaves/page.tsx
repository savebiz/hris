import { Metadata } from "next"
import { getTeamLeaves, approveLeaveManager, rejectLeaveManager } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export const metadata: Metadata = {
    title: "Team Leaves - DataGuard HRIS",
    description: "Manage team leave requests",
}

export default async function ManagerLeavesPage() {
    const leaves = await getTeamLeaves()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Team Leave Requests</h2>
            </div>

            <div className="grid gap-4">
                {leaves.length === 0 ? (
                    <p className="text-muted-foreground">No pending requests found.</p>
                ) : (
                    leaves.map((leave: any) => (
                        <Card key={leave.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{leave.profiles?.full_name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{leave.profiles?.job_title}</p>
                                    </div>
                                    <Badge>{leave.leave_type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="text-sm space-y-1">
                                        <p><strong>From:</strong> {new Date(leave.start_date).toLocaleDateString()}</p>
                                        <p><strong>To:</strong> {new Date(leave.end_date).toLocaleDateString()}</p>
                                        <p><strong>Reason:</strong> {leave.reason}</p>
                                    </div>
                                    <div className="flex items-end justify-end gap-2">
                                        <form action={async () => {
                                            'use server'
                                            await approveLeaveManager(leave.id)
                                        }}>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await rejectLeaveManager(leave.id)
                                        }}>
                                            <Button size="sm" variant="destructive">
                                                <XCircle className="mr-2 h-4 w-4" /> Decline
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
