import { Metadata } from "next"
import { getStaffList } from "../actions"
import { getLibraryItems } from "../../onboarding/actions"
import { CreateLibraryItemForm, AssignTaskForm } from "@/components/onboarding/forms"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Onboarding Management",
    description: "Manage onboarding tasks and assignments",
}

export default async function AdminOnboardingPage() {
    const staff = await getStaffList() || []
    const library = await getLibraryItems() || []

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Onboarding Workflows</h2>
            </div>

            <div className="grid gap-8">
                {/* Library Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Library</CardTitle>
                        <CardDescription>Define reusable tasks for onboarding new hires.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <CreateLibraryItemForm />

                        <div className="border rounded-md">
                            <div className="bg-muted px-4 py-2 text-sm font-medium grid grid-cols-12">
                                <span className="col-span-4">Title</span>
                                <span className="col-span-6">Description</span>
                                <span className="col-span-2 text-right">Role</span>
                            </div>
                            <div className="divide-y">
                                {library.map((item) => (
                                    <div key={item.id} className="px-4 py-3 text-sm grid grid-cols-12 items-center">
                                        <div className="col-span-4 font-medium">{item.title}</div>
                                        <div className="col-span-6 text-muted-foreground">{item.description || '-'}</div>
                                        <div className="col-span-2 text-right">
                                            <Badge variant="outline">{item.required_role || 'All'}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {library.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground">No items in library. Add one above.</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assign Tasks</CardTitle>
                        <CardDescription>Assign tasks from the library to employees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AssignTaskForm staff={staff} library={library} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
