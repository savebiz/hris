'use client'

import * as React from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
// import { Icons } from "@/components/icons" 
import { login } from "@/app/(auth)/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button disabled={pending}>
            {pending ? "Signing In..." : "Sign In with Email"}
        </Button>
    )
}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
    const searchParams = useSearchParams()
    const message = searchParams.get("message")
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
                    {message && (
                        <div className="bg-green-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-600 mb-4">
                            <p>{message}</p>
                        </div>
                    )}

                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            required
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Password"
                            type="password"
                            autoComplete="current-password"
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
