'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { ItemCard } from '@/components/item-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, Plus, Sparkles } from 'lucide-react'
import { Item, ItemType, ItemStatus } from '@/types'
import Link from 'next/link'

export default function LibraryPage() {
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const { data: items, isLoading, error } = useQuery({
        queryKey: ['items', search, typeFilter, statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('items')
                .select('*')
                .order('created_at', { ascending: false })

            if (search) query = query.ilike('title', `%${search}%`)
            if (typeFilter !== 'all') query = query.eq('type', typeFilter as ItemType)
            if (statusFilter !== 'all') query = query.eq('status', statusFilter as ItemStatus)

            const { data, error } = await query
            if (error) throw error
            return data as Item[]
        },
    })

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {}
            <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Koleksiyonunda ara..."
                        className="pl-11 h-12 w-full rounded-2xl bg-card border-none shadow-sm ring-1 ring-border group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px] h-12 rounded-2xl border-none shadow-sm ring-1 ring-border bg-card font-semibold">
                            <SelectValue placeholder="Türler" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all">Tüm Türler</SelectItem>
                            <SelectItem value="series">Diziler</SelectItem>
                            <SelectItem value="movie">Filmler</SelectItem>
                            <SelectItem value="book">Kitaplar</SelectItem>
                            <SelectItem value="game">Oyunlar</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="documentary">Belgeseller</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] h-12 rounded-2xl border-none shadow-sm ring-1 ring-border bg-card font-semibold">
                            <SelectValue placeholder="Durumlar" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all">Tüm Durumlar</SelectItem>
                            <SelectItem value="planned">Planlandı</SelectItem>
                            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                            <SelectItem value="completed">Bitti</SelectItem>
                            <SelectItem value="dropped">Bırakıldı</SelectItem>
                            <SelectItem value="rewatch">Tekrar</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-12">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-muted" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-destructive/10 text-destructive font-bold text-center">
                    Bir hata oluştu: {(error as Error).message}
                </div>
            ) : items?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50">
                    <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary opacity-30" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-bold">Kütüphanen henüz boş</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm">Aradığın kriterlere uygun içerik yok veya henüz eklemediniz.</p>
                    </div>
                    <Button size="lg" className="rounded-2xl px-10 font-bold" asChild>
                        <Link href="/i/new">İçerik Ekle</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {items?.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                    <Link href="/i/new" className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-muted bg-muted/5 p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02] aspect-[2/3] group relative overflow-hidden">
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
        </div>
    )
}
