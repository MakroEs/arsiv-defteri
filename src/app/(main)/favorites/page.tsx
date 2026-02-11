'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { ItemCard } from '@/components/item-card'
import { Star, Loader2, ChevronRight, Sparkles } from 'lucide-react'
import { Item } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FavoritesPage() {
    const supabase = createClient()

    const { data: favorites, isLoading, error } = useQuery({
        queryKey: ['items', 'favorites'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('is_favorite', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Item[]
        },
    })

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500 shadow-sm shadow-amber-500/5">
                        <Star className="h-5 w-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Koleksiyonum</span>
                </div>
                <div className="space-y-2">
                    <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground">Favoriler</h1>
                    <p className="text-muted-foreground font-serif italic text-lg opacity-80 max-w-2xl">En çok sevdiğiniz ve tekrar tekrar döndüğünüz o özel hikayeler.</p>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-12">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] w-full animate-pulse rounded-[1.5rem] bg-card border" />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-[2rem] border border-destructive/20 bg-destructive/5 p-8 text-destructive text-center font-bold">
                    <p>Bir hata oluştu</p>
                    <p className="text-sm opacity-80 mt-1">{(error as Error).message}</p>
                </div>
            ) : favorites?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50">
                    <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary opacity-30" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-bold">Henüz favori yok</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">Arşivinize içerik eklerken yıldız simgesine tıklayarak favorilerinize ekleyebilirsiniz.</p>
                    </div>
                    <Button size="lg" className="rounded-2xl px-10 font-bold" asChild>
                        <Link href="/library">
                            Kütüphaneye Göz At
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {favorites?.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}
