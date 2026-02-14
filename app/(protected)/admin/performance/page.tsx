import { Metadata } from "next"
import { getCycles } from "../../performance/actions"
import { CreateCycleForm } from "@/components/performance/forms"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Performance Management (Admin)",
    description: "Manage performance cycles",
}

export default async function AdminPerformancePage() {
    const cycles = await getCycles(true) || []

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Performance Management</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Cycles</CardTitle>
                    <CardDescription>Create and manage review periods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CreateCycleForm />

                    <div className="border rounded-md mt-4">
                        <div className="bg-muted px-4 py-2 text-sm font-medium grid grid-cols-12">
                            <span className="col-span-5">Title</span>
                            <span className="col-span-3">Dates</span>
                            <span className="col-span-2">Status</span>
                        </div>
                        <div className="divide-y">
                            {cycles.map((item) => (
                                <div key={item.id} className="px-4 py-3 text-sm grid grid-cols-12 items-center">
                                    <div className="col-span-5 font-medium">{item.title}</div>
                                    <div className="col-span-3 text-muted-foreground">
                                        {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
