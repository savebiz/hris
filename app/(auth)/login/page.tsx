import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { SplitLayout } from "@/components/shared/split-layout"
import { LoginForm } from "@/components/forms/login-form"

export const metadata: Metadata = {
    title: "Login - DataGuard HRIS",
    description: "Login to access your employee portal.",
}

export default function LoginPage() {
    return (
        <SplitLayout
            className="lg:p-8"
            quote="DataGuard is committed to protecting your personal data in compliance with the Nigeria Data Protection Regulation (NDPR)."
            author="Data Protection Officer"
        >
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Login to your account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>
            <LoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Privacy Notice
                </Link>{" "}
                and{" "}
                <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Terms of Service
                </Link>
                .
            </p>
        </SplitLayout>
    )
}
