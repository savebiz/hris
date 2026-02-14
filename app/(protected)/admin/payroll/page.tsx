import { Metadata } from "next"
import { getStaffList } from "../actions"
import { getPayslips } from "../../payroll/actions"
import { UploadPayslipForm } from "@/components/payroll/upload-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText } from "lucide-react"

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
                        <UploadPayslipForm staff={staff} />
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
