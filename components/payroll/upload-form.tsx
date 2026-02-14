"use client"

import { useFormState } from "react-dom"
import { uploadPayslip } from "@/app/(protected)/payroll/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { useEffect, useRef } from "react"

const initialState = {
    message: "",
    error: ""
}

export function UploadPayslipForm({ staff }: { staff: any[] }) {
    const [state, formAction] = useFormState(uploadPayslip, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            alert(state.message)
            formRef.current?.reset()
        } else if (state?.error) {
            alert(state.error)
        }
    }, [state])

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label>Employee</Label>
                <select
                    name="user_id"
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">Select Employee...</option>
                    {staff.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Month</Label>
                    <Input type="number" name="month" min="1" max="12" defaultValue={new Date().getMonth() + 1} required />
                </div>
                <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" name="year" min="2020" max="2100" defaultValue={new Date().getFullYear()} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Net Salary (Optional)</Label>
                <Input type="number" step="0.01" name="net_salary" placeholder="0.00" />
            </div>

            <div className="space-y-2">
                <Label>Payslip File (PDF)</Label>
                <Input type="file" name="file" accept=".pdf" required />
            </div>

            <Button type="submit" className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
        </form>
    )
}
