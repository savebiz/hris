'use client'

import { useRef } from "react"
import { createLibraryItem, assignTask } from "@/app/(protected)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, UserPlus } from "lucide-react"

export function CreateLibraryItemForm() {
    const formRef = useRef<HTMLFormElement>(null)

    async function action(formData: FormData) {
        const title = formData.get('title') as string
        const desc = formData.get('description') as string
        await createLibraryItem(title, desc)
        formRef.current?.reset()
        alert("Item added to library")
    }

    return (
        <form ref={formRef} action={action} className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50/50">
            <div className="flex-1 space-y-2">
                <Label>New Task Title</Label>
                <Input name="title" placeholder="e.g. Read Employee Handbook" required />
            </div>
            <div className="flex-1 space-y-2">
                <Label>Description (Optional)</Label>
                <Input name="description" placeholder="Short details..." />
            </div>
            <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Add to Library
            </Button>
        </form>
    )
}

export function AssignTaskForm({ staff, library }: { staff: any[], library: any[] }) {
    const formRef = useRef<HTMLFormElement>(null)

    async function action(formData: FormData) {
        const userId = formData.get('user_id') as string
        const itemId = formData.get('item_id') as string
        await assignTask(userId, itemId)
        formRef.current?.reset()
        alert("Task assigned successfully")
    }

    return (
        <form ref={formRef} action={action} className="grid md:grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50/50 items-end">
            <div className="space-y-2">
                <Label>Select Employee</Label>
                <select name="user_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Choose...</option>
                    {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <Label>Select Task</Label>
                <select name="item_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Choose...</option>
                    {library.map(i => (
                        <option key={i.id} value={i.id}>{i.title}</option>
                    ))}
                </select>
            </div>
            <Button type="submit">
                <UserPlus className="mr-2 h-4 w-4" /> Assign
            </Button>
        </form>
    )
}
