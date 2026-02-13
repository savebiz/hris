import { Metadata } from "next"
import { ProfileForm } from "@/components/forms/profile/profile-form"

export const metadata: Metadata = {
    title: "Admin Dashboard - DataGuard HRIS",
    description: "HR Administration Dashboard",
}

export default function AdminDashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    {/* Main Content Area - Form for Adding Staff */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4">Quick Action: Onboard New Staff</h3>
                        <ProfileForm />
                    </div>
                </div>

                <div className="col-span-3 space-y-4">
                    {/* Sidebar / Stats */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-2">System Status</h3>
                        <p className="text-sm text-muted-foreground">Admin panel active.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
