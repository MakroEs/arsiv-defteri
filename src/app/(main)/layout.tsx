'use client'

import { Sidebar } from "@/components/sidebar"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="grain-overlay" />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 border-r bg-card">
                <Sidebar />
            </aside>

            {/* Mobile Top Bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-20 bg-background/60 backdrop-blur-xl border-b border-white/5">
                <Link href="/dashboard" className="flex flex-col">
                    <span className="font-serif text-xl font-bold tracking-tight">Arşiv Defteri</span>
                    <span className="text-[8px] uppercase tracking-[0.2em] opacity-50 font-bold">Medya Kitaplığı</span>
                </Link>

                {mounted && (
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10">
                                <Menu className="h-6 w-6 text-primary" />
                                <span className="sr-only">Menüyü Aç</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 border-none">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigasyon Menüsü</SheetTitle>
                                <SheetDescription>Arşiv Defteri navigasyon seçenekleri</SheetDescription>
                            </SheetHeader>
                            <Sidebar onSelect={() => setOpen(false)} showLogo={false} />
                        </SheetContent>
                    </Sheet>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative">
                <div className={cn(
                    "container mx-auto p-6 md:p-8 lg:p-12 max-w-7xl min-h-screen",
                    "pt-28 lg:pt-12" // Padding for mobile top bar
                )}>
                    {children}
                </div>
            </main>
        </div>
    )
}
