"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"
// import { Icons } from "@/components/icons" 
import { signup } from "@/app/(auth)/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignUpFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function SignUpForm({ className, ...props }: SignUpFormProps) {
    const [error, setError] = React.useState<string | null>(null)

    async function clientAction(formData: FormData) {
        const result = await signup(formData)
        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form action={clientAction}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="full_name">
                            Full Name
                        </Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            placeholder="John Doe"
                            type="text"
                            autoCapitalize="words"
                            autoComplete="name"
                            autoCorrect="off"
                            required
                        />
                    </div>
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
                            autoComplete="new-password"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <SignUpButton />
                </div>
            </form>
        </div>
    )
}

function SignUpButton() {
    const { pending } = useFormStatus()

    return (
        <Button disabled={pending}>
            {pending ? (
                // <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                "Creating Account..."
            ) : (
                "Sign Up with Email"
            )}
        </Button>
    )
}
