'use client'

import { Goal, updateGoal } from "@/app/(protected)/performance/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Save } from "lucide-react"
import { useState } from "react"

export function GoalList({ goals }: { goals: Goal[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {goals.map(goal => (
                <GoalItem key={goal.id} goal={goal} />
            ))}
            {goals.length === 0 && (
                <div className="col-span-2 text-center text-muted-foreground py-8">
                    No goals set yet.
                </div>
            )}
        </div>
    )
}

function GoalItem({ goal }: { goal: Goal }) {
    const [progress, setProgress] = useState(goal.progress)
    const [status, setStatus] = useState(goal.status)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        await updateGoal(goal.id, progress, status)
        setLoading(false)
        alert("Goal updated")
    }

    return (
        <div className="p-4 border rounded-lg bg-card space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
                <Badge variant="outline">{status}</Badge>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="pt-2 flex gap-2 items-center">
                <Input
                    type="number"
                    min="0" max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-20 h-8 text-sm"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                <Button size="sm" variant="ghost" onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
