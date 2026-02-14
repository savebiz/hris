import { Metadata } from "next"
import { getProfileRequests, approveProfileRequest, rejectProfileRequest } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const metadata: Metadata = {
    title: "Profile Requests - DataGuard HRIS",
    description: "Manage profile update requests",
}

export default async function ProfileRequestsPage() {
    const requests = await getProfileRequests()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Profile Update Requests</h2>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
                        No pending profile requests.
                    </div>
                ) : (
                    requests.map((req: any) => (
                        <Card key={req.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={req.profiles?.avatar_url} />
                                        <AvatarFallback>{req.profiles?.full_name?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{req.profiles?.full_name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{req.profiles?.email}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-muted-foreground">Requested Changes:</h4>
                                        <div className="bg-slate-50 p-3 rounded-md border text-sm space-y-1">
                                            {Object.entries(req.data).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="font-medium capitalize text-slate-700">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-slate-900 font-bold">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-end gap-3 h-full">
                                        <form action={async () => {
                                            'use server'
                                            await approveProfileRequest(req.id)
                                        }}>
                                            <Button className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve Update
                                            </Button>
                                        </form>

                                        <form action={async () => {
                                            'use server'
                                            await rejectProfileRequest(req.id)
                                        }}>
                                            <Button variant="destructive">
                                                <XCircle className="mr-2 h-4 w-4" /> Reject
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
