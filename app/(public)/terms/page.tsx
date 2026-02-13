import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Use - DataGuard HRIS",
    description: "Acceptable Use Policy",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Acceptable Use Policy</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-sm text-muted-foreground mb-4">Effective Date: {new Date().toLocaleDateString()}</p>

                    <h3>1. Authorized Use</h3>
                    <p>
                        Access to the DataGuard HRIS is restricted to authorized employees and contractors of DataGuard Document Management Limited.
                        Unauthorized access is strictly prohibited and may result in disciplinary action or legal consequences.
                    </p>

                    <h3>2. User Responsibilities</h3>
                    <p>As a user of this system, you agree to:</p>
                    <ul>
                        <li>Keep your login credentials confidential.</li>
                        <li>Only access data relevant to your job function.</li>
                        <li>Ensure any personal data you upload is accurate and up-to-date.</li>
                        <li>Report any security incidents immediately to IT/HR.</li>
                    </ul>

                    <h3>3. Prohibited Activities</h3>
                    <p>You strictly must not:</p>
                    <ul>
                        <li>Attempt to bypass security controls or RLS policies.</li>
                        <li>Share sensitive employee data with external parties without authorization.</li>
                        <li>Upload malicious files or illegal content.</li>
                    </ul>

                    <h3>4. Monitoring</h3>
                    <p>
                        We monitor system activity for security and operational purposes. Your actions on this platform are logged and auditable.
                    </p>

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
