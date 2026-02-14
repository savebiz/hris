import { Metadata } from "next"
import { getTeamOnboardingStatus } from "../../onboarding/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, ListTodo } from "lucide-react"

export const metadata: Metadata = {
    title: "Team Onboarding - DataGuard HRIS",
    description: "Track team onboarding progress",
}

export default async function ManagerOnboardingPage() {
    const teamStatus = await getTeamOnboardingStatus()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Onboarding</h2>
                    <p className="text-muted-foreground">Monitor adoption and task completion</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamStatus.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No team members found.
                        </CardContent>
                    </Card>
                ) : (
                    teamStatus.map((status: any) => (
                        <Card key={status.user.id}>
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={status.user.avatar_url} />
                                    <AvatarFallback>{status.user.full_name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-sm truncate">{status.user.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{status.user.job_title || 'New Hire'}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Onboarding Progress</span>
                                        <span>{status.progress}%</span>
                                    </div>
                                    <Progress value={status.progress} className="h-2" />
                                    <p className="text-xs text-muted-foreground text-right">
                                        {status.completed} of {status.total} tasks completed
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    {status.progress === 100 ? (
                                        <span className="text-green-600 flex items-center gap-1 font-medium">
                                            <CheckCircle2 className="h-4 w-4" /> Completed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <ListTodo className="h-4 w-4" /> In Progress
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
