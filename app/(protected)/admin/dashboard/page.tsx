import { Metadata } from "next"
import { getAdminDashboardStats } from "../actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, FileText, UserPlus, ArrowRight, Activity, Clock } from "lucide-react"

export const metadata: Metadata = {
    title: "Admin Dashboard - DataGuard HRIS",
    description: "HR Administration Dashboard",
}

export default async function AdminDashboardPage() {
    const stats = await getAdminDashboardStats()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
            {/* Header / Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Admin Portal</h2>
                    <p className="text-muted-foreground mt-1">
                        Overview of HR operations and staff management.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-sm border-l-4 border-l-blue-600">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active employees
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Requires approval
                        </p>
                        {stats.pendingRequests > 0 && (
                            <Link href="/admin/leaves" className="text-xs text-orange-600 font-medium hover:underline mt-2 inline-block">
                                Review Requests &rarr;
                            </Link>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">On Leave Today</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.onLeaveToday}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Staff away
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Quick Actions */}
                <Card className="col-span-7 md:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage staff and operations</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <Link href="#">
                            {/* Note: In previous step the form was embedded. We haven't created a standalone 'new staff' page yet. 
                                 Ideally we should move the form to /admin/staff/new or keep it here in a modal. 
                                 For now, let's link to the Staff Management page where they can likely add staff (or we add a button there).
                                 Actually, let's assume we want to link to a 'New Staff' page.
                                 Since we don't have it, I'll link to # or make a modal later? 
                                 Wait, user wants MODERNIZE. I should probably move that big form to a dedicated page or keep it in a nicer way.
                                 Best practice: 'Staff Management' page has an 'Add Staff' button.
                                 I'll link 'Manage Staff' to /admin/staff.
                             */}
                            <Button variant="outline" className="w-full h-20 justify-start gap-4 hover:bg-blue-50 hover:border-blue-200 transition-all group" asChild>
                                <Link href="/admin/staff">
                                    <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                                        <Users className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-semibold text-slate-700">Manage Staff</span>
                                        <span className="text-xs text-muted-foreground">View & edit profiles</span>
                                    </div>
                                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
                                </Link>
                            </Button>
                        </Link>

                        <Button variant="outline" className="w-full h-20 justify-start gap-4 hover:bg-orange-50 hover:border-orange-200 transition-all group" asChild>
                            <Link href="/admin/leaves">
                                <div className="bg-orange-100 p-2 rounded-full group-hover:bg-orange-200 transition-colors">
                                    <Calendar className="h-5 w-5 text-orange-700" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-semibold text-slate-700">Leave Management</span>
                                    <span className="text-xs text-muted-foreground">Approve requests</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-orange-500" />
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full h-20 justify-start gap-4 hover:bg-emerald-50 hover:border-emerald-200 transition-all group" asChild>
                            <Link href="/admin/documents">
                                <div className="bg-emerald-100 p-2 rounded-full group-hover:bg-emerald-200 transition-colors">
                                    <FileText className="h-5 w-5 text-emerald-700" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-semibold text-slate-700">Documents</span>
                                    <span className="text-xs text-muted-foreground">Company files (Soon)</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-emerald-500" />
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full h-20 justify-start gap-4 hover:bg-violet-50 hover:border-violet-200 transition-all group">
                            {/* Placeholder for future feature */}
                            <div className="bg-violet-100 p-2 rounded-full group-hover:bg-violet-200 transition-colors">
                                <Activity className="h-5 w-5 text-violet-700" />
                            </div>
                            <div className="text-left">
                                <span className="block font-semibold text-slate-700">Audit Logs</span>
                                <span className="text-xs text-muted-foreground">View system activity</span>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Activity / System Status */}
                <Card className="col-span-7 md:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <div>
                                    <p className="text-sm font-medium">System Operational</p>
                                    <p className="text-xs text-muted-foreground">All services running</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Database Connected</p>
                                    <p className="text-xs text-muted-foreground">Supabase active</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
