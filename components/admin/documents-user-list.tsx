"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface StaffProfile {
    id: string
    full_name: string | null
    email: string | null
    role: string
    department: string | null
    job_title: string | null
    avatar_url?: string | null
}

interface DocumentsUserListProps {
    data: StaffProfile[]
}

export function DocumentsUserList({ data }: DocumentsUserListProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 border rounded-lg border-dashed">
                <FolderOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No staff directories found.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[80px]">Avatar</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((staff) => (
                        <TableRow key={staff.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell>
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                    <AvatarImage src={staff.avatar_url || ""} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                        {staff.full_name?.substring(0, 2).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700">{staff.full_name || "N/A"}</span>
                                    <span className="text-xs text-muted-foreground">{staff.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    {staff.department || "General"}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/admin/documents/${staff.id}`}>
                                    <Button variant="outline" size="sm" className="hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                        <FolderOpen className="mr-2 h-4 w-4" /> View Files
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
