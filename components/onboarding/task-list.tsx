'use client'

import { UserTask, toggleTaskStatus } from "@/app/(protected)/onboarding/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
// import { useOptimistic } from "react" // For future enhancement

export function EmployeeTaskList({ tasks }: { tasks: UserTask[] }) {
    const completedCount = tasks.filter(t => t.status === 'completed').length
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

    const handleToggle = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
        await toggleTaskStatus(taskId, newStatus)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Onboarding Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={cn(
                            "flex items-start gap-4 p-4 border rounded-lg transition-colors",
                            task.status === 'completed' ? "bg-muted/50 border-muted" : "bg-card hover:border-primary/50"
                        )}
                    >
                        <Checkbox
                            checked={task.status === 'completed'}
                            onCheckedChange={() => handleToggle(task.id, task.status)}
                            className="mt-1"
                        />
                        <div className="space-y-1">
                            <p className={cn(
                                "font-medium leading-none",
                                task.status === 'completed' && "text-muted-foreground line-through"
                            )}>
                                {task.library_item?.title || task.id}
                            </p>
                            {task.library_item?.description && (
                                <p className="text-sm text-muted-foreground">
                                    {task.library_item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No tasks assigned yet. You're all caught up!
                    </div>
                )}
            </div>
        </div>
    )
}
