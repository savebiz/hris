"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { EditStaffDialog } from "@/components/admin/edit-staff-dialog"

interface StaffProfile {
    id: string
    full_name: string | null
    email: string | null
    role: "hr_admin" | "line_manager" | "core_staff" | "support_staff"
    department: string | null
    job_title: string | null
    avatar_url?: string | null
    staff_type?: string // 'core' | 'support'
    // Add other fields as per schema
}

interface StaffListProps {
    data: StaffProfile[]
}

export function StaffList({ data }: StaffListProps) {
    const { toast } = useToast()
    const router = useRouter()

    if (!data.length) {
        return <div className="p-4 text-center text-muted-foreground">No staff records found.</div>
    }

    const handleCopyEmail = (email: string | null) => {
        if (!email) return
        navigator.clipboard.writeText(email)
        toast({ title: "Copied", description: "Email copied to clipboard" })
    }

    const handleDeactivate = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to deactivate ${name}? They will no longer be able to log in.`)) return

        const { deactivateStaff } = await import("@/app/(protected)/admin/actions")
        const result = await deactivateStaff(id)
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error })
        } else {
            toast({ title: "Deactivated", description: `${name} has been deactivated.` })
            router.refresh()
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department / Job</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((staff) => (
                    <TableRow key={staff.email || staff.id}>
                        <TableCell>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={staff.avatar_url || ""} alt={staff.full_name || "User"} />
                                <AvatarFallback>{staff.full_name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{staff.full_name || "N/A"}</TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>
                            <Badge variant={
                                staff.role === "hr_admin" ? "destructive" :
                                    staff.role === "line_manager" ? "warning" :
                                        "secondary"
                            }>
                                {staff.role.replace("_", " ")}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{staff.department || "-"}</span>
                                <span className="text-xs text-muted-foreground">{staff.job_title || staff.staff_type}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleCopyEmail(staff.email)}>
                                        Copy Email
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {/* Edit Dialog Trigger - we render it here but it's a dialog trigger 
                                        Note: Nesting dialog trigger inside dropdown menu can be tricky.
                                        We use 'onSelect={(e) => e.preventDefault()}' to prevent dropdown closing immediately 
                                        if using a controlled dialog, or use the Dialog structure carefully. 
                                        Actually, EditStaffDialog is a trigger itself. */}
                                    <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                                        <EditStaffDialog userId={staff.id} />
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDeactivate(staff.id, staff.full_name || "User")}
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> Deactivate
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
