import { Metadata } from "next"
import { getTeamGoals, getCycles } from "../../performance/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Target } from "lucide-react"

export const metadata: Metadata = {
    title: "Team Goals - DataGuard HRIS",
    description: "View team performance goals",
}

export default async function ManagerPerformancePage() {
    const goals = await getTeamGoals()
    const cycles = await getCycles() || []
    const activeCycle = cycles.find(c => c.status === 'active')

    // Filter goals for active cycle
    const activeGoals = activeCycle ? goals.filter(g => g.cycle_id === activeCycle.id) : []

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Performance</h2>
                    {activeCycle && (
                        <p className="text-muted-foreground">Cycle: {activeCycle.title}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                {activeGoals.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No active goals found for your team in this cycle.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeGoals.map((goal) => (
                            <Card key={goal.id}>
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={goal.profiles?.avatar_url} />
                                        <AvatarFallback>{goal.profiles?.full_name?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-sm truncate">{goal.profiles?.full_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{goal.profiles?.job_title || 'Team Member'}</p>
                                    </div>
                                    <Target className="ml-auto h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-base">{goal.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{goal.description || 'No description'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Progress</span>
                                            <span>{goal.progress}%</span>
                                        </div>
                                        <Progress value={goal.progress} className="h-2" />
                                    </div>

                                    <div className="pt-2 flex justify-between items-center">
                                        <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'in_progress' ? 'secondary' : 'outline'}>
                                            {goal.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{new Date(goal.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
