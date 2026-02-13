'use client'

import * as React from "react"
import { useFormStatus } from "react-dom"

import { cn } from "@/lib/utils"
// import { Icons } from "@/components/icons" 
import { login } from "@/app/(auth)/actions/auth"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            className={cn(
                "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                pending && "opacity-50 cursor-not-allowed"
            )}
            disabled={pending}
            type="submit"
        >
            {pending ? "Signing In..." : "Sign In with Email"}
        </button>
    )
}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

    async function clientAction(formData: FormData) {
        const result = await login(formData)
        if (result?.error) {
            setErrorMessage(result.error)
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form action={clientAction}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            placeholder="Password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                    {errorMessage && (
                        <div className="text-sm text-red-500">
                            {errorMessage}
                        </div>
                    )}
                    <SubmitButton />
                </div>
            </form>
        </div>
    )
}
