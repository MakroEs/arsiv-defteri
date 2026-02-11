"use client"
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, Filter, Sparkles, AlertTriangle, Lightbulb, Quote, StickyNote, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Note } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

interface NoteWithItem extends Note {
    items: {
        id: string;
        title: string;
        type: string;
    }
}

const noteTypeConfig = {
    spoiler: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Spoiler', icon: AlertTriangle },
    insight: { color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Analiz', icon: Lightbulb },
    quote: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Alıntı', icon: Quote },
    quick: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', label: 'Düşünce', icon: MessageSquare },
}

export default function NotesPage() {
    const supabase = createClient()
    const [typeFilter, setTypeFilter] = useState<string>('all')

    const { data: notes, isLoading } = useQuery({
        queryKey: ['all-notes', typeFilter],
        queryFn: async () => {
            let query = supabase
                .from('notes')
                .select(`
                    *,
                    items (
                        id,
                        title,
                        type
                    )
                `)
                .order('created_at', { ascending: false })

            if (typeFilter !== 'all') {
                query = query.eq('type', typeFilter as 'quick' | 'spoiler' | 'quote' | 'insight')
            }

            const { data, error } = await query
            if (error) throw error
            return data as unknown as NoteWithItem[]
        }
    })

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 text-primary shadow-sm shadow-primary/5">
                            <StickyNote className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Kütüphane</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground">Not Akışı</h1>
                    <p className="text-muted-foreground font-serif italic text-lg opacity-80 max-w-2xl">Tüm içerikleriniz için aldığınız notlar ve anlık düşünceler.</p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px] h-12 rounded-2xl border-none shadow-sm ring-1 ring-border bg-card font-bold">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 opacity-50" />
                                <SelectValue placeholder="Filtrele" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all">Tüm Notlar</SelectItem>
                            <SelectItem value="quick">Düşünceler</SelectItem>
                            <SelectItem value="spoiler">Spoiler'lar</SelectItem>
                            <SelectItem value="quote">Alıntılar</SelectItem>
                            <SelectItem value="insight">Analizler</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 w-full animate-pulse rounded-[2rem] bg-card border" />
                    ))}
                </div>
            ) : notes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50">
                    <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary opacity-30" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-bold">Henüz not yok</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">İçeriklerinizi görüntülerken aldığınız notlar burada toplanır.</p>
                    </div>
                    <Button size="lg" className="rounded-2xl px-10 font-bold" asChild>
                        <Link href="/library">
                            Koleksiyonuna Göz At
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notes?.map((note) => {
                        const config = noteTypeConfig[note.type as keyof typeof noteTypeConfig] || noteTypeConfig.quick
                        const NoteIcon = config.icon
                        return (
                            <Link
                                key={note.id}
                                href={`/i/${note.items.id}`}
                                className="group flex flex-col rounded-[2rem] border bg-card p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:ring-2 hover:ring-primary/40"
                            >
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                                        <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                            {note.items.title}
                                        </h4>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                            {note.items.type}
                                        </span>
                                    </div>
                                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl shrink-0 backdrop-blur-md", config.color.split(' ')[0])}>
                                        <NoteIcon className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    {note.type === 'spoiler' ? (
                                        <div className="flex items-center gap-2 text-sm font-bold text-rose-500">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Spoiler İçeriyor</span>
                                        </div>
                                    ) : (
                                        <p className={cn(
                                            "text-base leading-relaxed text-foreground/70 whitespace-pre-wrap line-clamp-4",
                                            note.type === 'quote' ? "italic font-serif pl-3 border-l-2 border-primary/20" : ""
                                        )}>
                                            {note.content}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                    <Badge variant="outline" className={cn("border-none px-0 py-0 text-[9px]", config.color.split(' ')[1])}>
                                        {config.label}
                                    </Badge>
                                    <span>{format(new Date(note.created_at), 'd MMM yyyy', { locale: tr })}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

