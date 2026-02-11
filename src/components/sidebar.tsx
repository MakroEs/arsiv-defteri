'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import {
    LayoutGrid,
    Library,
    Star,
    MessageSquare,
    BarChart3,
    Settings,
    Plus,
    LogOut,
    User,
    Moon,
    Sun,
    Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const sidebarItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/library', label: 'Kütüphane', icon: Library },
    { href: '/favorites', label: 'Favoriler', icon: Star },
    { href: '/notes', label: 'Notlar', icon: MessageSquare },
    { href: '/stats', label: 'İstatistik', icon: BarChart3 },
    { href: '/settings', label: 'Ayarlar', icon: Settings },
]

export function Sidebar({ className, onSelect, showLogo = true }: { className?: string, onSelect?: () => void, showLogo?: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    const fetchUserData = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                setUser(authUser)
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()
                if (profileData) setProfile(profileData)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }, [supabase])

    useEffect(() => {
        fetchUserData()
    }, [fetchUserData])

    useEffect(() => {
        const handleProfileUpdate = () => fetchUserData()
        window.addEventListener('profile-updated', handleProfileUpdate)
        return () => window.removeEventListener('profile-updated', handleProfileUpdate)
    }, [fetchUserData])

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Çıkış yapılırken bir hata oluştu')
        } else {
            router.push('/login')
        }
    }

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'
    const initials = getInitials(displayName)
    const avatarColor = getAvatarColor(displayName)

    if (!mounted) return null

    return (
        <div className={cn("flex h-full w-full flex-col border-r bg-sidebar text-sidebar-foreground transition-colors duration-300", className)}>
            {/* 1. Logo Section */}
            {showLogo && (
                <div className="px-8 py-10">
                    <Link href="/dashboard" className="group block space-y-1">
                        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            Arşiv Defteri
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-70">
                            Kişisel Medya Kitaplığı
                        </p>
                    </Link>
                </div>
            )}

            {/* 2. Quick Action */}
            <div className="px-6 pb-8">
                <Button
                    className="w-full justify-start gap-3 rounded-xl bg-primary px-5 py-6 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] font-semibold"
                    onClick={() => {
                        router.push('/i/new')
                        onSelect?.()
                    }}
                >
                    <Plus className="h-5 w-5" />
                    Yeni Ekle
                </Button>
            </div>

            {/* 3. Navigation */}
            <div className="flex-1 overflow-auto px-3">
                <nav className="space-y-1.5">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={onSelect}
                                className={cn(
                                    "group relative flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary" />
                                )}
                                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* 4. Bottom Section: Profile & Logout */}
            <div className="mt-auto border-t p-4 space-y-4">
                <div className="flex items-center justify-between gap-2 rounded-xl border bg-card/50 p-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarImage src={profile?.avatar_url || ''} />
                            <AvatarFallback className={cn("text-white text-xs font-bold", avatarColor)}>
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate">
                            <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
                            <span className="truncate text-[10px] text-muted-foreground font-medium uppercase tracking-wider">PREMIUM</span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-sidebar-accent">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profil Ayarları</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="flex items-center justify-between px-2 py-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                                <span className="text-xs font-medium">Tema</span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTheme('light')}><Sun className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTheme('dark')}><Moon className="h-3 w-3" /></Button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Oturumu Kapat</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
