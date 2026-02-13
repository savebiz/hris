import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2 font-semibold" href="#">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>DataGuard HRIS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  DataGuard HR Portal
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamlined Human Resource Management for Core and Support Staff.
                  Manage profiles, leave requests, and confidential documents securely.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8">
                    Login to Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-3 lg:gap-10">
            <div className="flex flex-col gap-2 border p-6 rounded-lg">
              <h3 className="text-xl font-bold">Profile Management</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Comprehensive profiles for HR Admins, Core Staff, and Support Staff with role-specific fields.
              </p>
            </div>
            <div className="flex flex-col gap-2 border p-6 rounded-lg">
              <h3 className="text-xl font-bold">Document Repository</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Securely upload and store confidential documents like employment contracts and ID cards.
              </p>
            </div>
            <div className="flex flex-col gap-2 border p-6 rounded-lg">
              <h3 className="text-xl font-bold">Leave Management</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Digital leave request workflows with history tracking and status updates.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-light text-xs text-gray-500">
        <p>© 2026 DataGuard Document Management Limited. All rights reserved.</p>
      </footer>
    </div>
  )
}
