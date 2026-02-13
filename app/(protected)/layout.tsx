import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile for role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'core_staff'

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar role={role} />

            <div className="flex-1 flex flex-col lg:pl-64 min-h-screen transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 md:p-8 pt-6 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    )
}
