'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { AuthError } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/admin/dashboard') // Redirect logic will be handled by middleware later ideally
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Get the origin dynamically to support Vercel preview/production URLs
    // Note: headers() is async in Next.js 15
    const headersList = await import("next/headers").then(mod => mod.headers())
    const origin = headersList.get("origin") || "https://hris-kappa.vercel.app" // Fallback to provided Vercel URL

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Force sign out to prevent auto-login (which causes middleware to redirect to dashboard)
    if (data.session) {
        await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check your email for confirmation.')
}
