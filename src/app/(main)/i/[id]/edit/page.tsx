'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Upload, ChevronLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Item } from '@/types'

const formSchema = z.object({
    title: z.string().min(1, 'Başlık zorunludur.'),
    type: z.enum(['series', 'movie', 'book', 'manga', 'game', 'podcast', 'documentary']),
    status: z.enum(['planned', 'in_progress', 'completed', 'dropped', 'rewatch']),
    rating: z.string().optional(),
    progress: z.string().optional(),
    notes: z.string().optional(),
    review: z.string().optional(),
    is_favorite: z.boolean(),
})

export default function EditItemPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [isSaving, setIsSaving] = useState(false)
    const [coverFile, setCoverFile] = useState<File | null>(null)

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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            type: 'movie',
            status: 'planned',
            rating: '',
            progress: '',
            notes: '',
            review: '',
            is_favorite: false,
        },
    })

    useEffect(() => {
        if (item) {
            form.reset({
                title: item.title,
                type: item.type as any,
                status: item.status as any,
                rating: item.rating?.toString() || '',
                progress: item.progress_unit || '',
                notes: item.short_note || '',
                review: item.review || '',
                is_favorite: item.is_favorite,
            })
        }
    }, [item, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSaving(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error('Oturum açmanız gerekiyor.')
                return
            }

            let coverUrl = item?.cover_url || null

            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(fileName, coverFile)

                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('covers')
                    .getPublicUrl(fileName)

                coverUrl = publicUrlData.publicUrl
            }

            let progressValue = null
            let progressUnit = values.progress || null

            if (values.progress) {
                const numberMatch = values.progress.match(/\d+/)
                if (numberMatch) {
                    progressValue = parseInt(numberMatch[0])
                }
            }

            const { error } = await supabase.from('items').update({
                title: values.title,
                type: values.type,
                status: values.status,
                rating: values.rating ? parseInt(values.rating) : null,
                progress_value: progressValue,
                progress_unit: progressUnit,
                short_note: values.notes || null,
                review: values.review || null,
                is_favorite: values.is_favorite,
                cover_url: coverUrl,
                updated_at: new Date().toISOString()
            }).eq('id', id)

            if (error) throw error

            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['item', id] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })

            toast.success('İçerik güncellendi')
            router.push(`/i/${id}`)
        } catch (error) {
            toast.error('Guncellenirken bir hata oluştu')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="rounded-xl gap-2 font-bold text-muted-foreground" onClick={() => router.back()}>
                        <ChevronLeft className="h-4 w-4" /> Geri Dön
                    </Button>
                    <h1 className="font-serif text-3xl font-bold">Düzenle</h1>
                </div>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="rounded-xl gap-2 font-bold bg-primary shadow-lg shadow-primary/20">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Değişiklikleri Kaydet
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-card">
                                <CardContent className="p-0 relative aspect-[2/3]">
                                    {coverFile ? (
                                        <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : item?.cover_url ? (
                                        <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <span className="opacity-20 font-serif text-2xl font-bold">Kapak Yok</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <FormItem>
                                            <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest mb-2 block">Yeni Kapak Yükle</FormLabel>
                                            <FormControl>
                                                <div className="relative group cursor-pointer">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                                    />
                                                    <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white py-2 rounded-xl border border-white/20 group-hover:bg-white/30 transition-all">
                                                        <Upload className="h-4 w-4" />
                                                        <span className="text-xs font-bold">Görsel Seç</span>
                                                    </div>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    </div>
                                </CardContent>
                            </Card>

                            <FormField
                                control={form.control}
                                name="is_favorite"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border-none bg-amber-500/5 px-6 py-4 ring-1 ring-amber-500/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-amber-500 text-white">
                                                <Save className="h-4 w-4" />
                                            </div>
                                            <FormLabel className="font-bold text-amber-900 dark:text-amber-200">Favori İçerik</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-amber-500 border-amber-500" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="col-span-full">
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">İçerik Başlığı</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-14 rounded-2xl border-none ring-1 ring-border bg-card text-xl font-bold focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">İçerik Türü</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl border-none ring-1 ring-border bg-card font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="series">Dizi</SelectItem>
                                                    <SelectItem value="movie">Film</SelectItem>
                                                    <SelectItem value="book">Kitap</SelectItem>
                                                    <SelectItem value="game">Oyun</SelectItem>
                                                    <SelectItem value="podcast">Podcast</SelectItem>
                                                    <SelectItem value="documentary">Belgesel</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mevcut Durum</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl border-none ring-1 ring-border bg-card font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="planned">Planlandı</SelectItem>
                                                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                                                    <SelectItem value="completed">Bitti</SelectItem>
                                                    <SelectItem value="dropped">Bırakıldı</SelectItem>
                                                    <SelectItem value="rewatch">Tekrar</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Puan (10 Üzerinden)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" max="10" {...field} className="h-12 rounded-xl border-none ring-1 ring-border bg-card font-bold" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="progress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">İlerleme</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: 5. Bölüm" {...field} className="h-12 rounded-xl border-none ring-1 ring-border bg-card font-bold" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="review"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detaylı İnceleme</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Neler düşünüyorsun? Karakterler, kurgu..." className="min-h-[200px] rounded-[2rem] border-none ring-1 ring-border bg-card p-6 text-lg leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all font-medium" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
