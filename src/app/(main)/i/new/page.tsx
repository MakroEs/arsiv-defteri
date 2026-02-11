'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Upload, ChevronLeft } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
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

export default function NewItemPage() {
    const router = useRouter()
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)
    const [coverFile, setCoverFile] = useState<File | null>(null)

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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error('Oturum açmanız gerekiyor.')
                return
            }

            let coverUrl = '/1.jpg'

            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(fileName, coverFile)

                if (uploadError) {
                    throw uploadError
                }

                const { data: publicUrlData } = supabase.storage
                    .from('covers')
                    .getPublicUrl(fileName)

                coverUrl = publicUrlData.publicUrl
            }

            // Progress parsing (e.g., "Season 3" -> value: 3, unit: "Season")
            let progressValue = null
            let progressUnit = values.progress || null

            if (values.progress) {
                const numberMatch = values.progress.match(/\d+/)
                if (numberMatch) {
                    progressValue = parseInt(numberMatch[0])
                    // Optional: remove number from unit if you want, but keeping it as is for now
                }
            }

            const { error } = await supabase.from('items').insert({
                user_id: user.id,
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
                visibility: 'private'
            })

            if (error) throw error

            // Invalidate queries to refresh the list in library and dashboard
            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })

            toast.success('İçerik eklendi')
            router.push('/dashboard')
        } catch (error) {
            toast.error('Bir hata oluştu', {
                description: (error as Error).message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Yeni Ekle</h2>
                    <p className="text-slate-500">Arşivine yeni bir içerik ekle.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                        {/* LEFT COLUMN: Basic Info */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-none bg-transparent">
                                <CardContent className="p-0 space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Başlık</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Örn: Inception" {...field} className="bg-white dark:bg-slate-950" />
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
                                                <FormLabel>Tür</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white dark:bg-slate-950">
                                                            <SelectValue placeholder="Tür seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="series">Dizi</SelectItem>
                                                        <SelectItem value="movie">Film</SelectItem>
                                                        <SelectItem value="book">Kitap</SelectItem>
                                                        <SelectItem value="game">Oyun</SelectItem>
                                                        <SelectItem value="podcast">Podcast</SelectItem>
                                                        <SelectItem value="documentary">Belgesel</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Durum</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white dark:bg-slate-950">
                                                            <SelectValue placeholder="Durum seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="planned">Planlandı</SelectItem>
                                                        <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                                                        <SelectItem value="completed">Bitti</SelectItem>
                                                        <SelectItem value="dropped">Bırakıldı</SelectItem>
                                                        <SelectItem value="rewatch">Tekrar</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="rating"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Puan (0-10)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" max="10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="progress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>İlerleme</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Örn: 3. Sezon 5. Bölüm" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormItem>
                                        <FormLabel>Kapak Görseli</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)}
                                                    className="cursor-pointer file:text-primary"
                                                />
                                                <Upload className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </FormControl>
                                    </FormItem>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kısa Not</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Örn: Tavsiye üzerine başladım." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="review"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Detaylı İnceleme</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Düşünceleriniz..." className="resize-none min-h-[120px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_favorite"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Favorilere Ekle</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Kaydet
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
