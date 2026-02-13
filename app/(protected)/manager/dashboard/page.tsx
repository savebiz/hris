import { Metadata } from "next"
import { getManagerDashboardStats, getTeamLeaves, getMyTeam, approveLeaveManager, rejectLeaveManager } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Manager Dashboard - DataGuard HRIS",
    description: "Team management",
}

export default async function ManagerDashboard() {
    const stats = await getManagerDashboardStats()
    const leaves = await getTeamLeaves()
    const team = await getMyTeam()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Team</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.teamCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingReview}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Pending Approvals</h2>
                {leaves.length === 0 ? (
                    <p className="text-muted-foreground">No pending requests.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {leaves.map((leave: any) => (
                            <Card key={leave.id} className="border-l-4 border-l-orange-400">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={leave.profiles?.avatar_url} />
                                            <AvatarFallback>{leave.profiles?.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base">{leave.profiles?.full_name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{leave.leave_type}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm mb-4">
                                        <p><strong>From:</strong> {new Date(leave.start_date).toLocaleDateString()}</p>
                                        <p><strong>To:</strong> {new Date(leave.end_date).toLocaleDateString()}</p>
                                        <p className="mt-2 text-muted-foreground italic">"{leave.reason}"</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={async () => {
                                            'use server'
                                            await approveLeaveManager(leave.id)
                                        }}>
                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await rejectLeaveManager(leave.id)
                                        }}>
                                            <Button size="sm" variant="destructive" className="w-full">
                                                <XCircle className="mr-2 h-4 w-4" /> Decline
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Team List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">My Team</h2>
                <div className="rounded-md border bg-white">
                    <div className="p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {team.map((member: any) => (
                            <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                                <Avatar>
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback>{member.full_name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{member.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{member.job_title || 'Staff'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
