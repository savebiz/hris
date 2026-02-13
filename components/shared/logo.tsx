import { ShieldCheck } from "lucide-react"
import Link from "next/link"

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground md:text-sidebar-foreground">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldCheck className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-lg tracking-tight">DataGuard</span>
                <span className="text-xs font-normal opacity-70">HRIS Portal</span>
            </div>
        </Link>
    )
}
