'use client'

export const dynamic = 'force-dynamic'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ChevronLeft, Edit, Star, Trash2, Calendar, BookOpen, Clock, Play, CheckCircle2, XCircle, RefreshCw, Info, MessageSquare, StickyNote, Quote, Lightbulb, AlertTriangle, Fingerprint } from 'lucide-react'
import { Item, Note } from '@/types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { InlineNoteForm } from '@/components/inline-note-form'

const statusConfig = {
    planned: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Clock, label: 'Planlandı' },
    in_progress: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: Play, label: 'Devam Ediyor' },
    completed: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2, label: 'Bitti' },
    dropped: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle, label: 'Bırakıldı' },
    rewatch: { color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: RefreshCw, label: 'Tekrar' },
}

const noteTypeConfig = {
    spoiler: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Spoiler', icon: AlertTriangle },
    insight: { color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Analiz', icon: Lightbulb },
    quote: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Alıntı', icon: Quote },
    quick: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', label: 'Düşünce', icon: MessageSquare },
}

export default function ItemDetailPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const supabase = createClient()
    const queryClient = useQueryClient()

    const { data: item, isLoading } = useQuery({
        queryKey: ['item', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data as Item
        }
    })

    const { data: notes, refetch: refetchNotes } = useQuery({
        queryKey: ['notes', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('item_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Note[]
        },
        enabled: !!item
    })

    const handleDelete = async () => {
        const { error } = await supabase.from('items').delete().eq('id', id)
        if (error) {
            toast.error('Silinirken bir hata oluştu')
        } else {

            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })

            toast.success('İçerik silindi')
            router.push('/library')
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!item) return <div className="p-12 text-center font-serif text-2xl opacity-50">İçerik bulunamadı</div>

    const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.planned
    const StatusIcon = status.icon

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="pl-0 gap-2 font-bold text-muted-foreground hover:text-primary transition-colors" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                    Arşive Dön
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-none shadow-sm ring-1 ring-border bg-card" onClick={() => router.push(`/i/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                            <AlertDialogHeader className="space-y-3">
                                <AlertDialogTitle className="font-serif text-2xl font-bold">Arşivden Silinsin mi?</AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                    Bu içerik ve kütüphanendeki tüm notlar kalıcı olarak silinecek. Bu işlemi geri alamazsın.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-3 pt-4">
                                <AlertDialogCancel className="rounded-xl border-none bg-secondary font-bold">Vazgeç</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive font-bold text-white hover:bg-destructive/90">Silmeyi Onayla</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {}
                <div className="lg:col-span-4 space-y-8">
                    {}
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2.5rem] bg-card border shadow-2xl shadow-primary/5 transition-transform duration-500 hover:scale-[1.01]">
                        {item.cover_url ? (
                            <Image
                                src={item.cover_url}
                                alt={item.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <Image
                                src="/1.jpg"
                                alt={item.title}
                                fill
                                className="object-cover opacity-40"
                                priority
                            />
                        )}

                        {item.is_favorite && (
                            <div className="absolute right-6 top-6 z-10">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20">
                                    <Star className="h-6 w-6 fill-current" />
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-6 left-6 z-10">
                            <Badge variant="outline" className={cn("flex items-center gap-2 border-none px-4 py-2 text-xs font-bold shadow-2xl backdrop-blur-xl", status.color)}>
                                <StatusIcon className="h-4 w-4" />
                                {status.label}
                            </Badge>
                        </div>
                    </div>

                    {}
                    <div className="rounded-[2rem] border bg-card p-8 space-y-8 shadow-sm">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Puan</p>
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    <span className="text-2xl font-serif font-bold text-foreground">{item.rating || '--'}/10</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">İlerleme</p>
                                <p className="text-lg font-bold font-serif text-foreground">
                                    {item.progress_value || '--'} <span className="text-sm font-medium text-muted-foreground">{item.progress_unit || 'Bölüm'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-widest leading-none">Eklenme: {format(new Date(item.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="lg:col-span-8 flex flex-col space-y-10">
                    <div>
                        <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-none text-[10px] font-bold tracking-[0.2em] uppercase">
                            {item.type}
                        </Badge>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight text-foreground">
                            {item.title}
                        </h1>
                    </div>

                    <Tabs defaultValue="notes" className="w-full">
                        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto gap-10">
                            <TabsTrigger value="notes" className="px-0 py-4 font-serif text-xl font-bold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all">Notlar</TabsTrigger>
                            <TabsTrigger value="review" className="px-0 py-4 font-serif text-xl font-bold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all">İnceleme</TabsTrigger>
                            <TabsTrigger value="info" className="px-0 py-4 font-serif text-xl font-bold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all">Detaylar</TabsTrigger>
                        </TabsList>

                        <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
                            <div className="mb-10">
                                <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Düşüncelerim</h3>
                                <InlineNoteForm itemId={id} onSuccess={() => refetchNotes()} />
                            </div>

                            {notes && notes.length > 0 ? (
                                <div className="space-y-6">
                                    {notes.map((note) => {
                                        const config = noteTypeConfig[note.type as keyof typeof noteTypeConfig] || noteTypeConfig.quick
                                        return (
                                            <div key={note.id} className="group relative rounded-3xl border bg-card/50 p-6 md:p-8 transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Badge variant="outline" className={cn("border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider", config.color)}>
                                                        {config.label}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{format(new Date(note.created_at), 'd MMM yyyy', { locale: tr })}</span>
                                                </div>

                                                {note.type === 'spoiler' ? (
                                                    <details className="cursor-pointer group/spoiler">
                                                        <summary className="flex items-center gap-3 text-base font-bold text-rose-500 select-none group-hover/spoiler:underline decoration-2 underline-offset-4 transition-all">
                                                            <Info className="h-4 w-4" />
                                                            Spoiler İçeriyor (Görmek için tıkla)
                                                        </summary>
                                                        <div className="mt-6 text-lg leading-relaxed text-foreground/80 pl-6 border-l-2 border-rose-200 animate-in slide-in-from-top-2 duration-300">
                                                            <p className="whitespace-pre-wrap">{note.content}</p>
                                                        </div>
                                                    </details>
                                                ) : (
                                                    <div className="relative">
                                                        {note.type === 'quote' && (
                                                            <span className="absolute -left-6 -top-4 text-6xl text-primary/10 font-serif leading-none">“</span>
                                                        )}
                                                        <p className={cn(
                                                            "text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap",
                                                            note.type === 'quote' ? "italic font-serif pl-2" : ""
                                                        )}>
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50 text-center space-y-4">
                                    <MessageSquare className="h-10 w-10 text-muted-foreground opacity-20" />
                                    <p className="text-muted-foreground font-medium">Henüz bir not düşmedin.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="review" className="mt-0 focus-visible:outline-none">
                            {item.review ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <div className="rounded-[2.5rem] bg-card p-8 md:p-12 border shadow-sm prose-p:text-xl prose-p:leading-relaxed prose-p:text-foreground/80">
                                        <p className="whitespace-pre-wrap">{item.review}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50">
                                    <BookOpen className="h-12 w-12 text-primary opacity-20" />
                                    <div className="space-y-2">
                                        <h3 className="font-serif text-2xl font-bold">İnceleme Bulunamadı</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto text-sm">Bu içerik hakkında henüz detaylı bir değerlendirme yapmadın.</p>
                                    </div>
                                    <Button size="lg" variant="outline" className="rounded-2xl border-none shadow-sm ring-1 ring-border bg-card font-bold" onClick={() => router.push(`/i/${id}/edit`)}>Hemen Yaz</Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-[2rem] border bg-card p-8 space-y-6">
                                    <h4 className="font-serif text-xl font-bold mb-4">Detaylar</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Tür</dt>
                                            <dd className="text-lg font-bold font-serif capitalize">{item.type}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Durum</dt>
                                            <dd className="text-lg font-bold font-serif capitalize">{status.label}</dd>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-[2rem] border bg-card p-8 space-y-6">
                                    <h4 className="font-serif text-xl font-bold mb-4">Sistem</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Kayıt Kimliği</dt>
                                            <dd className="text-xs font-mono font-medium opacity-50 truncate">{item.id}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Son Güncelleme</dt>
                                            <dd className="text-xs font-semibold">{format(new Date(item.updated_at), 'd MMM yyyy, HH:mm', { locale: tr })}</dd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
