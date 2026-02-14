import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileCorrectionDialog } from "@/components/employee/profile-correction-dialog"
import { Badge } from "@/components/ui/badge"
import { getMyProfileRequests } from "../actions"

export default async function EmployeeProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Unauthorized</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const requests = await getMyProfileRequests()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>
                {/* Dialog trigger */}
                <ProfileCorrectionDialog profile={profile} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-muted-foreground">Full Name</label>
                                <p className="font-medium">{profile?.full_name}</p>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Email</label>
                                <p className="font-medium">{profile?.email}</p>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Phone</label>
                                <p className="font-medium">{profile?.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Role</label>
                                <p className="font-medium capitalize">{profile?.role?.replace('_', ' ')}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-muted-foreground">Address</label>
                                <p className="font-medium">{profile?.address || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Correction Request History</CardTitle>
                        <CardDescription>Status of your recent update requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent requests.</p>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="text-sm">
                                            <p className="font-medium">Update Request</p>
                                            <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {req.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
