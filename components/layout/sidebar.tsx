"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, LayoutDashboard, Users, FileText, Calendar, Menu, LogOut, Settings, Banknote, ListTodo, Target } from "lucide-react"

import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Assuming standard button
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    role?: "hr_admin" | "line_manager" | "core_staff" | "support_staff"
}

export function Sidebar({ className, role = "core_staff" }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const navItems = [
        {
            title: "Dashboard",
            href: role === "hr_admin" ? "/admin/dashboard" : "/employee/dashboard",
            icon: LayoutDashboard,
            active: pathname.includes("/dashboard"),
            roles: ["hr_admin", "line_manager", "core_staff", "support_staff"]
        },
        {
            title: "Team Leaves",
            href: "/manager/leaves",
            icon: Users,
            active: pathname.includes("/manager/leaves"),
            roles: ["line_manager"]
        },
        {
            title: role === "hr_admin" ? "Leave Management" : "My Leaves",
            href: role === "hr_admin" ? "/admin/leaves" : "/employee/leaves",
            icon: Calendar,
            active: pathname.includes("/employee/leaves") || pathname.includes("/admin/leaves"),
            roles: ["hr_admin", "line_manager", "core_staff", "support_staff"]
        },
        {
            title: role === "hr_admin" ? "Documents" : "My Documents",
            href: role === "hr_admin" ? "/admin/documents" : "/employee/documents", // Placeholder
            icon: FileText,
            active: pathname.includes("/documents"),
            roles: ["hr_admin", "line_manager", "core_staff", "support_staff"]
        },
    ]

    const filteredNav = navItems.filter(item => item.roles.includes(role))

    return (
        <div className={cn("pb-12 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-64 hidden lg:block fixed left-0 top-0", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-6 px-4">
                        <Logo />
                    </div>
                    <div className="space-y-1">
                        {filteredNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={item.active ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-2",
                                        item.active
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 w-full px-4">
                <Separator className="bg-sidebar-border mb-4" />
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}

export function MobileSidebar({ role = "core_staff" }: SidebarProps) {
    const pathname = usePathname()
    // Duplicate logic for mobile - in a real app, extract to shared hook/component
    const navItems = [
        {
            title: "Dashboard",
            href: role === "hr_admin" ? "/admin/dashboard" : "/employee/dashboard",
            icon: LayoutDashboard,
            active: pathname.includes("/dashboard"),
            roles: ["hr_admin", "line_manager", "core_staff", "support_staff"]
        },
        // Admin
        {
            title: "Staff Management",
            href: "/admin/staff",
            icon: Users,
            active: pathname.includes("/staff"),
            roles: ["hr_admin"]
        },
        {
            title: "Profile Requests",
            href: "/admin/requests",
            icon: Users,
            active: pathname.includes("/requests"),
            roles: ["hr_admin"]
        },
        {
            title: "Payroll",
            href: "/admin/payroll",
            icon: Banknote,
            active: pathname.includes("/admin/payroll"),
            roles: ["hr_admin"]
        },
        {
            title: "Payroll",
            href: "/admin/payroll",
            icon: Banknote,
            active: pathname.includes("/admin/payroll"),
            roles: ["hr_admin"]
        },
        {
            title: "Payroll",
            href: "/admin/payroll",
            icon: Banknote,
            active: pathname.includes("/admin/payroll"),
            roles: ["hr_admin"]
        },
        {
            title: "Onboarding",
            href: "/admin/onboarding",
            icon: ListTodo,
            active: pathname.includes("/admin/onboarding"),
            roles: ["hr_admin"]
        },
        {
            title: "Performance",
            href: "/admin/performance",
            icon: Target,
            active: pathname.includes("/admin/performance"),
            roles: ["hr_admin"]
        },
        // Manager
        {
            title: "Team Leaves",
            href: "/manager/leaves",
            icon: Users,
            active: pathname.includes("/manager/leaves"),
            roles: ["line_manager"]
        },
        // Shared
        {
            title: role === "hr_admin" ? "Leave Management" : "My Leaves",
            href: role === "hr_admin" ? "/admin/leaves" : "/employee/leaves",
            icon: Calendar,
            active: pathname.includes("/employee/leaves") || pathname.includes("/admin/leaves"),
            roles: ["hr_admin", "line_manager", "core_staff", "support_staff"]
        },
        {
            title: role === "hr_admin" ? "Documents" : "My Documents",
            href: role === "hr_admin" ? "/admin/documents" : "/employee/documents",
            icon: FileText,
            active: pathname.includes("/documents"),
            roles: ["hr_admin", "line_manager", "core_staff", "support_staff"]
        },
    ]
    const filteredNav = navItems.filter(item => item.roles.includes(role))

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar text-sidebar-foreground border-sidebar-border p-0">
                <SheetHeader className="p-6 border-b border-sidebar-border">
                    <SheetTitle className="text-sidebar-foreground"><Logo /></SheetTitle>
                </SheetHeader>
                <div className="px-4 py-4">
                    <div className="space-y-1">
                        {filteredNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={item.active ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-2 mb-1",
                                        item.active
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
