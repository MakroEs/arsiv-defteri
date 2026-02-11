'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlayCircle, Plus, Sparkles, Library } from "lucide-react"
import { Item } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemCard } from '@/components/item-card'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (data) setProfile(data)
            }
        }
        getProfile()
    }, [supabase])

    const { data: watchingItems, isLoading: loadingWatching } = useQuery({
        queryKey: ['dashboard', 'in_progress'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('status', 'in_progress')
                .limit(4)
                .order('updated_at', { ascending: false })

            if (error) throw error
            return data as Item[]
        }
    })

    const { data: recentItems, isLoading: loadingRecent } = useQuery({
        queryKey: ['dashboard', 'recent'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .limit(12)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Item[]
        }
    })

    const { data: randomPick } = useQuery({
        queryKey: ['dashboard', 'random'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('status', 'planned')

            if (error) throw error
            if (!data || data.length === 0) return null

            const randomIndex = Math.floor(Math.random() * data.length)
            return data[randomIndex] as Item
        }
    })

    const hasItems = (recentItems && recentItems.length > 0) || (watchingItems && watchingItems.length > 0)

    return (
        <div className="space-y-16 pb-20 animate-in fade-in duration-700">
            {}
            <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                            <Library className="h-5 w-5" />
                        </div>
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                        Merhaba, {profile?.full_name?.split(' ')[0] || 'Gezgin'}
                    </h1>
                    <p className="text-muted-foreground font-serif italic text-lg opacity-80 max-w-2xl">
                        Kişisel arşivindeki son gelişmelere ve yarım kalan hikayelere göz at.
                    </p>
                </div>
                <Button className="rounded-2xl h-14 px-8 gap-3 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-base shrink-0" asChild>
                    <Link href="/i/new">
                        <Plus className="h-5 w-5" />
                        Yeni İçerik Ekle
                    </Link>
                </Button>
            </div>

            {!hasItems && !loadingRecent && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary opacity-50" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-bold">Henüz içerik eklemedin</h2>
                        <p className="text-muted-foreground max-w-sm">Kişisel arşivini oluşturmaya başlamak için ilk içeriğini ekle.</p>
                    </div>
                    <Button size="lg" className="rounded-xl px-8" asChild>
                        <Link href="/i/new">
                            <Plus className="mr-2 h-5 w-5" />
                            Yeni Ekle
                        </Link>
                    </Button>
                </div>
            )}

            {}
            {randomPick && (
                <section className="relative group overflow-hidden rounded-[2rem] bg-card border shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-5 lg:p-12">
                        <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
                            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-none px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                                Senin İçin Seçtik
                            </Badge>
                            <h3 className="font-serif text-4xl font-bold md:text-6xl leading-[1.1] tracking-tight text-foreground">
                                {randomPick.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-3 text-lg leading-relaxed max-w-xl">
                                {(randomPick.short_note) || "Bu içerik listenizde keşfedilmeyi bekliyor. Bugün bir şans vermeye ne dersiniz?"}
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <Button size="lg" className="rounded-xl px-8 gap-2 font-bold shadow-lg shadow-primary/20" asChild>
                                    <Link href={`/i/${randomPick.id}`}>
                                        <PlayCircle className="h-5 w-5" />
                                        Hemen Başla
                                    </Link>
                                </Button>
                                <Badge variant="outline" className="h-10 px-4 rounded-xl border-dashed opacity-60">
                                    {randomPick.type.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="lg:col-span-2 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.03] group-hover:rotate-1">
                            {randomPick.cover_url ? (
                                <Image src={randomPick.cover_url} alt={randomPick.title} fill className="object-cover object-center" />
                            ) : (
                                <Image src="/1.jpg" alt={randomPick.title} fill className="object-cover object-center opacity-40" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        </div>
                    </div>
                </section>
            )}

            {}
            {watchingItems && watchingItems.length > 0 && (
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-serif text-3xl font-bold text-foreground">Devam Et</h3>
                            <p className="text-sm text-muted-foreground">Yarım kalan hikayelere geri dön.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-primary" asChild>
                            <Link href="/library?status=in_progress">Hepsini Gör</Link>
                        </Button>
                    </div>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {watchingItems.map((item) => (
                            <Link key={item.id} href={`/i/${item.id}`} className="group relative aspect-video overflow-hidden rounded-2xl border bg-muted transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                                {item.cover_url ? (
                                    <Image src={item.cover_url} alt={item.title} fill className="object-cover object-center opacity-80 transition-all group-hover:opacity-100 group-hover:scale-105" />
                                ) : (
                                    <Image src="/1.jpg" alt={item.title} fill className="object-cover object-center opacity-40 group-hover:opacity-60 transition-all" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">{item.type}</p>
                                    <h4 className="font-serif text-lg font-bold truncate">{item.title}</h4>
                                    {(item.progress_value || item.progress_unit) && (
                                        <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-white/80">
                                            <span className="h-1 w-1 rounded-full bg-primary"></span>
                                            {item.progress_value} {item.progress_unit}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="font-serif text-3xl font-bold text-foreground">Son Eklenenler</h3>
                        <p className="text-sm text-muted-foreground">Arşivine yeni katılanlar.</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-primary" asChild>
                        <Link href="/library">Tamamını Görüntüle</Link>
                    </Button>
                </div>

                {loadingRecent ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {recentItems?.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                        <Link href="/i/new" className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted bg-muted/5 p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02] aspect-[2/3] group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="rounded-2xl bg-background p-4 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-12">
                                    <Plus className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-sm font-bold font-serif">İçerik Ekle</span>
                                    <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Kütüphane</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    )
}
