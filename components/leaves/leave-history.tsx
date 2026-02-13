import { format } from "date-fns"
import { Badge } from "@/components/ui/badge" // Need to create Badge or use standard div
// Assuming I don't have Badge yet, I'll use a helper function for styling

function getStatusColor(status: string) {
    switch (status) {
        case 'approved': return 'bg-green-100 text-green-800'
        case 'declined': return 'bg-red-100 text-red-800'
        default: return 'bg-yellow-100 text-yellow-800'
    }
}

export function LeaveHistory({ leaves }: { leaves: any[] }) {
    if (!leaves?.length) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No leave history found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Leave History</h3>
            <div className="rounded-md border">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Duration</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dates</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{leave.leave_type}</td>
                                    <td className="p-4 align-middle">
                                        {/* Simple calc, ideally use date-fns difference */}
                                        {Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                    </td>
                                    <td className="p-4 align-middle">
                                        {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
