import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Calendar, User, Upload } from "lucide-react"

export const metadata: Metadata = {
    title: "Dashboard - DataGuard HRIS",
    description: "Employee Self-Service Dashboard",
}

export default function EmployeeDashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Quick Stats / Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Days available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Uploaded files</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Actions */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Link href="/employee/leaves">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <Calendar className="h-6 w-6" />
                                Request Leave
                            </Button>
                        </Link>
                        {/* 
                  TODO: Add Document Upload Page/Modal link 
                  For now we can link to a documents page if we had one, 
                  or just put the upload component here later.
                */}
                        <Button variant="outline" className="w-full h-24 flex flex-col gap-2" disabled>
                            <Upload className="h-6 w-6" />
                            Upload Docs (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
