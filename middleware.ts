import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes pattern
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isManagerRoute = request.nextUrl.pathname.startsWith('/manager')
    const isEmployeeRoute = request.nextUrl.pathname.startsWith('/employee')
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')

    // Redirect to login if accessing protected route without user
    if (!user && (isAdminRoute || isManagerRoute || isEmployeeRoute)) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is logged in, check role and redirect if necessary
    if (user) {
        // Fetch user profile to get role
        // Note: In a real app, you might want to cache this or use custom claims in session
        // For Phase 1, fetching here is acceptable but might be slightly slower
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'core_staff'

        // Prevent access to wrong dashboards
        if (isAdminRoute && role !== 'hr_admin') {
            return NextResponse.redirect(new URL('/employee/dashboard', request.url)) // Fallback to employee dash
        }

        // Redirect from login to dashboard if already logged in
        if (isAuthRoute) {
            if (role === 'hr_admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            } else if (role === 'line_manager') {
                return NextResponse.redirect(new URL('/manager/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/employee/dashboard', request.url))
            }
        }

        // Default redirect for root / if logged in
        if (request.nextUrl.pathname === '/') {
            if (role === 'hr_admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            } else if (role === 'line_manager') {
                return NextResponse.redirect(new URL('/manager/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/employee/dashboard', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
