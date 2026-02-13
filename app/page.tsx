import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, CheckCircle2, Lock, Users, FileText } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-6">
          <div className="flex gap-6 md:gap-10">
            <Link className="flex items-center space-x-2" href="/">
              <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="inline-block font-bold text-xl tracking-tight">DataGuard HRIS</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Link href="/login">
                <Button variant="ghost" className="text-base font-medium">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center px-4">
            <Link
              href="/login"
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium transition-colors hover:text-primary"
            >
              Secure. Compliant. Efficient.
            </Link>
            <h1 className="font-heading text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl text-foreground tracking-tight">
              Modern HR Management for <span className="text-primary">DataGuard</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              The central hub for managing staff profiles, confidential documents, and leave requests with enterprise-grade security.
            </p>
            <div className="space-x-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20">
                  Login to Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container space-y-6 py-8 dark:bg-transparent md:py-12 lg:py-24 px-6">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 text-card-foreground hover:shadow-md transition-shadow">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Users className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Staff Profiles</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive role-based profiles for Core and Support staff.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 text-card-foreground hover:shadow-md transition-shadow">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Lock className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Secure Docs</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade storage for contracts and confidential files.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 text-card-foreground hover:shadow-md transition-shadow">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <FileText className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Leave Sys</h3>
                  <p className="text-sm text-muted-foreground">
                    Streamlined leave requests, approvals, and history tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container py-12 md:py-24 lg:py-32 bg-slate-900 text-white rounded-t-3xl mt-12">
          <div className="mx-auto max-w-[58rem] flex flex-col items-center space-y-4 text-center px-6">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Trusted by DataGuard Management
            </h2>
            <p className="max-w-[85%] leading-normal text-slate-300 sm:text-lg sm:leading-7">
              Built to ensure NDPR compliance and operational excellence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle2 className="text-green-400 h-6 w-6" />
                <span className="font-medium">Confidentiality Assured</span>
              </div>
              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle2 className="text-green-400 h-6 w-6" />
                <span className="font-medium">24/7 Availability</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-slate-950 text-slate-400">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-6">
          <p className="text-center text-sm leading-loose md:text-left">
            © 2026 DataGuard Document Management Limited.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white underline-offset-4 hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:text-white underline-offset-4 hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
