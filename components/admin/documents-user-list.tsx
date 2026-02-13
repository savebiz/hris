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
    if (!data.length) {
        return <div className="p-4 text-center text-muted-foreground">No staff directories found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((staff) => (
                    <TableRow key={staff.id}>
                        <TableCell>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={staff.avatar_url || ""} />
                                <AvatarFallback>{staff.full_name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{staff.full_name || "N/A"}</span>
                                <span className="text-xs text-muted-foreground">{staff.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>{staff.department || "-"}</TableCell>
                        <TableCell className="text-right">
                            <Link href={`/admin/documents/${staff.id}`}>
                                <Button variant="outline" size="sm">
                                    <FolderOpen className="mr-2 h-4 w-4" /> View Files
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
