'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
    content: z.string().min(1, 'Not içeriği boş olamaz.'),
    type: z.enum(['quick', 'spoiler', 'quote', 'insight']),
})

interface AddNoteDialogProps {
    itemId: string
    onSuccess?: () => void
}

export function AddNoteDialog({ itemId, onSuccess }: AddNoteDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
            type: 'quick',
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

            const { error } = await supabase.from('notes').insert({
                item_id: itemId,
                user_id: user.id,
                content: values.content,
                type: values.type,
            })

            if (error) throw error

            toast.success('Not eklendi')
            form.reset()
            setOpen(false)
            onSuccess?.()
            router.refresh()
        } catch (error) {
            toast.error('Not eklenirken bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2 font-bold shadow-sm ring-1 ring-border border-none bg-card hover:bg-secondary transition-all">
                    <Plus className="h-4 w-4" />
                    Not Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8">
                <DialogHeader className="space-y-3 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                        <MessageSquarePlus className="h-6 w-6" />
                    </div>
                    <DialogTitle className="font-serif text-3xl font-bold">Yeni Not</DialogTitle>
                    <DialogDescription className="text-base">
                        Düşüncelerini, analizlerini veya önemli alıntıları buraya kaydedebilirsin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Not Tipi</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-none ring-1 ring-border shadow-sm focus:ring-2 focus:ring-primary/20 bg-card font-semibold">
                                                <SelectValue placeholder="Tip seçin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-border">
                                            <SelectItem value="quick">Hızlı Not</SelectItem>
                                            <SelectItem value="spoiler">Spoiler (Gizli)</SelectItem>
                                            <SelectItem value="quote">Alıntı</SelectItem>
                                            <SelectItem value="insight">Analiz / Yorum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">İçerik</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Neler düşünüyorsun?"
                                            className="resize-none rounded-xl border-none ring-1 ring-border shadow-sm focus:ring-2 focus:ring-primary/20 bg-card p-4 min-h-[120px] font-medium"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-2">
                            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : 'Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
