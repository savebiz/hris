import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, Upload, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Dashboard - DataGuard HRIS",
    description: "Employee Self-Service Dashboard",
}

export default async function EmployeeDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in.</div>
    }

    // Parallel fetching for performance
    const [profileReq, balanceReq, recentLeavesReq, docsReq] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('leave_balances').select('*').eq('user_id', user.id).single(),
        supabase.from('leave_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.storage.from('confidential-docs').list(user.id)
    ])

    const profile = profileReq.data
    const balances = balanceReq.data || {
        annual_total: 20, annual_used: 0,
        sick_total: 10, sick_used: 0,
        casual_total: 5, casual_used: 0
    } // Fallback if no record
    const recentLeaves = recentLeavesReq.data || []
    const docCount = docsReq.data?.length || 0

    // Time greeting
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
                <div className="relative z-10 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white/50">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="text-slate-900 font-bold text-xl">{profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{greeting}, {profile?.full_name?.split(' ')[0]}! 👋</h2>
                        <p className="text-blue-100 mt-1">Here's what's happening today.</p>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-10 -mb-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
            </div>

            {/* Leave Balances Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Annual Leave</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{balances.annual_total - balances.annual_used}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            out of {balances.annual_total} days available
                        </p>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${((balances.annual_total - balances.annual_used) / balances.annual_total) * 100}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sick Leave</CardTitle>
                        <div className="h-4 w-4 text-purple-500">🏥</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{balances.sick_total - balances.sick_used}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            out of {balances.sick_total} days available
                        </p>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${((balances.sick_total - balances.sick_used) / balances.sick_total) * 100}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Casual Leave</CardTitle>
                        <div className="h-4 w-4 text-orange-500">🏖️</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{balances.casual_total - balances.casual_used}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            out of {balances.casual_total} days available
                        </p>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${((balances.casual_total - balances.casual_used) / balances.casual_total) * 100}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest leave requests and their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentLeaves.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
                            ) : (
                                recentLeaves.map((leave: any) => (
                                    <div key={leave.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${leave.leave_type === 'Sick' ? 'bg-purple-100 text-purple-600' :
                                                leave.leave_type === 'Annual' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{leave.leave_type} Leave</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            leave.status === 'approved' ? "success" :
                                                leave.status === 'rejected' || leave.status === 'declined' ? "destructive" :
                                                    "warning"
                                        }>
                                            {leave.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used tools</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link href="/employee/leaves">
                            <Button variant="outline" className="w-full h-16 justify-start gap-4 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <Calendar className="h-5 w-5 text-blue-700" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-700">Request Leave</span>
                                    <span className="text-xs text-muted-foreground">Apply for time off</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
                            </Button>
                        </Link>

                        <Link href="/employee/documents">
                            <Button variant="outline" className="w-full h-16 justify-start gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                    <Upload className="h-5 w-5 text-emerald-700" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-700">Upload Documents</span>
                                    <span className="text-xs text-muted-foreground">{docCount} files uploaded</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-emerald-500" />
                            </Button>
                        </Link>

                        <Button variant="outline" className="w-full h-16 justify-start gap-4 hover:border-violet-500 hover:bg-violet-50 transition-all group" disabled>
                            <div className="bg-violet-100 p-2 rounded-lg group-hover:bg-violet-200 transition-colors">
                                <User className="h-5 w-5 text-violet-700" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-700">Update Profile</span>
                                <span className="text-xs text-muted-foreground">Edit personal details (Soon)</span>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
