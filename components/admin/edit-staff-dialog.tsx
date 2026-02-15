"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createStaffSchema } from "@/lib/schemas/admin"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getStaffDetails } from "@/app/(protected)/admin/actions"
import { Edit } from "lucide-react"

// We can likely reuse the schema, but might need to make some fields optional if partial updates were allowed.
// For admin edit, we usually want to validte the whole formstate anyway.
// However, 'createStaffSchema' enforces Staff Category which is fine.

interface EditStaffDialogProps {
    userId: string
}

export function EditStaffDialog({ userId }: EditStaffDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof createStaffSchema>>({
        resolver: zodResolver(createStaffSchema),
        defaultValues: {
            email: "",
            full_name: "",
            phone_number: "",
            residential_address: "",
            staff_category: "core",
            role: "core_staff",
            department: "",
            job_title: "",
            staff_id: "",
        },
    })

    const staffCategory = form.watch("staff_category")

    // Fetch data when dialog opens
    useEffect(() => {
        if (open) {
            setIsLoading(true)
            getStaffDetails(userId).then((result) => {
                if (result.error) {
                    toast({ variant: "destructive", title: "Error", description: result.error })
                    setOpen(false)
                    return
                }

                const { profile, coreDetails, supportDetails, category } = result as any

                form.reset({
                    email: profile.email,
                    full_name: profile.full_name,
                    phone_number: profile.phone_number || "",
                    residential_address: profile.residential_address || "",
                    staff_category: category,

                    // Core
                    role: profile.role,
                    department: coreDetails?.department || "",
                    job_title: coreDetails?.job_title || "",
                    staff_id: coreDetails?.staff_id || "",
                    date_of_employment: coreDetails?.date_of_employment || undefined,

                    // Support
                    project_assignment: supportDetails?.project_assignment || "",
                    project_location: supportDetails?.project_location || "",
                    supervisor_name: supportDetails?.supervisor_name || "",
                    deployment_start_date: supportDetails?.deployment_start_date || undefined
                })
            }).finally(() => setIsLoading(false))
        }
    }, [open, userId, form, toast])


    function onSubmit(values: z.infer<typeof createStaffSchema>) {
        startTransition(async () => {
            const { updateStaff } = await import("@/app/(protected)/admin/actions")
            const result = await updateStaff(userId, values)
            if (result.error) {
                toast({ variant: "destructive", title: "Update Failed", description: result.error })
            } else {
                toast({ title: "Success", description: "Staff profile updated successfully." })
                setOpen(false)
                router.refresh()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Staff Member</DialogTitle>
                    <DialogDescription>
                        Update profile and employment details.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Loading details...</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Category - Disabled for Edit usually, but let's see. 
                                Changing category might be complex (deleting from one table, adding to other).
                                For now render it as disabled or read-only info */}
                            <FormField
                                control={form.control}
                                name="staff_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Staff Category</FormLabel>
                                        <div className="p-2 border rounded-md bg-muted text-sm capitalize">{field.value}</div>
                                    </FormItem>
                                )}
                            />

                            {/* Common Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="residential_address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Core Staff Specific */}
                            {staffCategory === "core" && (
                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Core Staff Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="core_staff">Core Staff</SelectItem>
                                                            <SelectItem value="line_manager">Line Manager</SelectItem>
                                                            <SelectItem value="hr_admin">HR Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="staff_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Staff ID</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="department"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="job_title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Job Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="date_of_employment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date of Employment</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Support Staff Specific */}
                            {staffCategory === "support" && (
                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Support Staff Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="project_assignment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Assignment</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="project_location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="supervisor_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Supervisor</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deployment_start_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Deployment Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Updating..." : "Update Profile"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
