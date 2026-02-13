"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// import { useToast } from "@/components/ui/use-toast" // Removed to fix build error, using alert() for now 
// Re-check installation command: `npm install ... @radix-ui/react-toast` was run, but `shadcn` components need to be added. 
// I will implement a basic alert/state for now to avoid dependency hell if `toaster.tsx` isn't set up.
// Actually, I'll use standard state for feedback to be safe.

import { LeaveFormValues, leaveSchema } from "@/lib/schemas/leave"
import { submitLeaveRequest } from "@/app/(protected)/employee/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LeaveRequestForm() {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    // const { toast } = useToast() 

    const form = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            // start_date: new Date().toISOString().split('T')[0],
        },
    })

    async function onSubmit(data: LeaveFormValues) {
        startTransition(async () => {
            const result = await submitLeaveRequest(data)
            if (result.error) {
                alert(result.error) // Replace with Toast later
            } else {
                alert(result.message) // Replace with Toast later
                form.reset()
                router.refresh()
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Leave</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="leave_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leave Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select leave type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Annual">Annual Leave</SelectItem>
                                            <SelectItem value="Sick">Sick Leave</SelectItem>
                                            <SelectItem value="Casual">Casual Leave</SelectItem>
                                            <SelectItem value="Maternity">Maternity Leave</SelectItem>
                                            <SelectItem value="Paternity">Paternity Leave</SelectItem>
                                            <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief reason for leave..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
