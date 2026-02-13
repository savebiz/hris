import { Metadata } from "next"
import { getAuditLogs } from "@/app/(protected)/admin/actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Activity } from "lucide-react"

export const metadata: Metadata = {
    title: "Audit Logs - DataGuard HRIS",
    description: "System activity logs",
}

export default async function AuditLogsPage() {
    const logs = await getAuditLogs()

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create': return 'bg-green-100 text-green-700'
            case 'upload': return 'bg-green-100 text-green-700'
            case 'update': return 'bg-blue-100 text-blue-700'
            case 'approve': return 'bg-emerald-100 text-emerald-700'
            case 'reject': return 'bg-red-100 text-red-700'
            case 'delete': return 'bg-red-100 text-red-700'
            case 'view': return 'bg-slate-100 text-slate-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                <p className="text-muted-foreground">Recent system activity (Last 50)</p>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span>{log.profiles?.full_name || 'Unknown User'}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-5">{log.profiles?.role}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getActionColor(log.action)}>
                                        {log.action.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{log.resource_type}</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">
                                    {log.details ? JSON.stringify(log.details) : '-'}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {new Date(log.created_at).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
