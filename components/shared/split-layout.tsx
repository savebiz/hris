import { cn } from "@/lib/utils"

interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    image?: React.ReactNode
    quote?: string
    author?: string
}

export function SplitLayout({
    children,
    className,
    image,
    quote,
    author,
    ...props
}: SplitLayoutProps) {
    return (
        <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    DataGuard HRIS
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            {quote || "Secure. Compliant. Efficient."}
                        </p>
                        <footer className="text-sm">{author || "DataGuard HR Team"}</footer>
                    </blockquote>
                </div>
            </div>
            <div className={cn("lg:p-8", className)} {...props}>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
