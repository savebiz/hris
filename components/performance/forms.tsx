'use client'

import { useFormState } from "react-dom"
import { createCycle, createGoal, GoalState } from "@/app/(protected)/performance/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useEffect, useRef } from "react"

const initialState: GoalState = {
    message: "",
    error: ""
}

export function CreateCycleForm() {
    const [state, formAction] = useFormState(createCycle, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            alert(state.message) // Replace with toast ideally
            formRef.current?.reset()
        }
    }, [state])

    return (
        <form ref={formRef} action={formAction} className="grid md:grid-cols-4 gap-4 items-end border p-4 rounded-lg bg-gray-50/50">
            <div className="md:col-span-2 space-y-2">
                <Label>Cycle Title</Label>
                <Input name="title" placeholder="e.g. Q1 2026 Performance Review" required />
            </div>
            <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" name="start_date" required />
            </div>
            <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" name="end_date" required />
            </div>
            <div className="space-y-2">
                <Label>Status</Label>
                <select name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                </select>
            </div>
            <div className="md:col-start-4">
                <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Create Cycle
                </Button>
            </div>
        </form>
    )
}

export function CreateGoalForm({ cycles }: { cycles: any[] }) {
    const [state, formAction] = useFormState(createGoal, initialState)
    const formRef = useRef<HTMLFormElement>(null)
    const activeCycle = cycles.find(c => c.status === 'active')

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
        }
    }, [state])

    if (!activeCycle) {
        return <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded border">No active performance cycle found. Contact HR.</div>
    }

    return (
        <form ref={formRef} action={formAction} className="space-y-4 border p-4 rounded-lg bg-white">
            <input type="hidden" name="cycle_id" value={activeCycle.id} />
            <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input name="title" placeholder="e.g. Increase sales by 10%" required />
            </div>
            <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" placeholder="Success metrics..." />
            </div>
            <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Goal for {activeCycle.title}
            </Button>
        </form>
    )
}
