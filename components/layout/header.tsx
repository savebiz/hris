import { MobileSidebar } from "./sidebar"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

export async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch profile for role/name
    const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }
    const role = profile?.role || 'core_staff'

    return (
        <header className="flex h-16 items-center border-b bg-sidebar lg:bg-background lg:border-b-border px-6 sticky top-0 z-50">
            <MobileSidebar role={role} />
            <div className="flex flex-1 items-center justify-between ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-sidebar-foreground lg:text-foreground hidden sm:block">
                    {/* Breadcrumbs or Page Title could go here */}
                </h1>

                <div className="flex items-center gap-4 ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8 border border-border">
                                    <AvatarImage src="/avatars/01.png" alt={profile?.first_name || "User"} />
                                    <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{profile?.first_name} {profile?.last_name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {profile?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href="/employee/profile" className="cursor-pointer w-full flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    My Profile
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                {/* We can't use Next.js navigation in MenuItem easily for logout action without client component, so keeping simple link for now or handle via client wrapper */}
                                <form action="/auth/signout" method="post" className="w-full">
                                    <button className="flex w-full items-center" type="submit">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
