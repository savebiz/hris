import { Metadata } from "next"
import { getStaffList } from "../actions"
import { getPayslips, uploadPayslip } from "../../payroll/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText } from "lucide-react"

export const metadata: Metadata = {
    title: "Payroll Management - DataGuard HRIS",
    description: "Upload and manage employee payslips",
}

export default async function AdminPayrollPage() {
    const staff = await getStaffList() || []
    const recents = await getPayslips()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Payroll Management</h2>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Payslip</CardTitle>
                        <CardDescription>Upload a PDF payslip for an employee.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={uploadPayslip} className="space-y-4">
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
                    </CardContent>
                </Card>

                {/* Recent Uploads List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Uploads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recents.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No records found.</p>
                        ) : (
                            <div className="space-y-4">
                                {recents.slice(0, 10).map((record: any) => (
                                    <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{record.profiles?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(0, record.month - 1).toLocaleString('default', { month: 'long' })} {record.year}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {record.net_salary && (
                                                <p className="text-sm font-bold">₦{record.net_salary.toLocaleString()}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">{new Date(record.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
