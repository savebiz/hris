import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Notice - DataGuard HRIS",
    description: "Data Privacy Policy",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Data Privacy Notice</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-sm text-muted-foreground mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3>1. Introduction</h3>
                    <p>
                        DataGuard Document Management Limited ("DataGuard", "we", "us") respects your privacy and is committed to protecting your personal data.
                        This Privacy Notice explains how we collect, use, and share your personal information when you use our internal Human Resources Information System (HRIS).
                    </p>

                    <h3>2. Data We Collect</h3>
                    <p>We collect the following types of personal data for employment and administrative purposes:</p>
                    <ul>
                        <li><strong>Identity Data:</strong> Name, Date of Birth, Gender, Passport/ID numbers.</li>
                        <li><strong>Contact Data:</strong> Email address, Phone number, Home address.</li>
                        <li><strong>Employment Data:</strong> Job title, Department, Salary, Employment history.</li>
                        <li><strong>Usage Data:</strong> System access logs, IP addresses, and document upload history.</li>
                    </ul>

                    <h3>3. How We Use Your Data</h3>
                    <p>We use your data strictly for legitimate business purposes, including:</p>
                    <ul>
                        <li>Processing payroll and benefits.</li>
                        <li>Managing leave requests and attendance.</li>
                        <li>Ensuring compliance with Nigerian Data Protection Regulation (NDPR) and other laws.</li>
                        <li>Security and audit logging (see Audit Logs).</li>
                    </ul>

                    <h3>4. Data Security</h3>
                    <p>
                        Your data is stored securely using encryption both in transit and at rest. Access is restricted based on your role (e.g., only HR Admins can view sensitive salary data).
                    </p>

                    <h3>5. Your Rights</h3>
                    <p>Under the NDPR, you have the right to request access to, correction of, or deletion of your personal data. Please contact the Compliance Officer if you have concerns.</p>

                    <div className="mt-8 pt-8 border-t">
                        <p className="text-sm text-center text-muted-foreground">
                            &copy; {new Date().getFullYear()} DataGuard Document Management Limited. Internal Use Only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
