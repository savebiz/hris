import { createClient } from "@/lib/supabase/server"
import { getPayslips } from "../../payroll/actions"
import { PayslipDownloadButton } from "@/components/payroll/download-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default async function EmployeePayrollPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Unauthorized</div>

    const payslips = await getPayslips(user.id) || []

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">My Payslips</h2>
            <p className="text-muted-foreground">View and download your monthly payslips.</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payslips.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-muted-foreground border rounded-lg bg-slate-50">
                        No payslips found.
                    </div>
                ) : (
                    payslips.map((slip: any) => (
                        <Card key={slip.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {new Date(0, slip.month - 1).toLocaleString('default', { month: 'long' })} {slip.year}
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {slip.net_salary ? `₦${slip.net_salary.toLocaleString()}` : 'Payslip'}
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Uploaded {new Date(slip.created_at).toLocaleDateString()}
                                </p>
                                <PayslipDownloadButton
                                    path={slip.file_path}
                                    filename={`Payslip_${slip.month}_${slip.year}.pdf`}
                                />
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
