'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, SendHorizonal, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const formSchema = z.object({
    content: z.string().min(1, 'Not içeriği boş olamaz.'),
    type: z.enum(['quick', 'spoiler', 'quote', 'insight']),
    is_spoiler: z.boolean(),
})

interface InlineNoteFormProps {
    itemId: string
    onSuccess?: () => void
}

export function InlineNoteForm({ itemId, onSuccess }: InlineNoteFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
            type: 'quick',
            is_spoiler: false,
        },
    })

    const isSpoiler = form.watch('is_spoiler')

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

            const finalType = values.is_spoiler ? 'spoiler' : values.type

            const { error } = await supabase.from('notes').insert({
                item_id: itemId,
                user_id: user.id,
                content: values.content,
                type: finalType,
            })

            if (error) throw error

            queryClient.invalidateQueries({ queryKey: ['notes', itemId] })
            queryClient.invalidateQueries({ queryKey: ['all-notes'] })

            toast.success('Not eklendi')
            form.reset({
                content: '',
                type: 'quick',
                is_spoiler: false,
            })
            onSuccess?.()
        } catch (error) {
            toast.error('Not eklenirken bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="rounded-[2rem] border bg-card/30 p-6 md:p-8 shadow-sm backdrop-blur-sm">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Bu içerik hakkında ne düşünüyorsun?"
                                                className="min-h-[100px] resize-none rounded-2xl border-none bg-background/50 p-4 text-lg ring-1 ring-border focus:ring-2 focus:ring-primary/20 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col justify-between gap-4 md:w-64">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className={cn(isSpoiler && "opacity-50 pointer-events-none")}>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isSpoiler}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl border-none bg-background/50 ring-1 ring-border font-bold">
                                                        <SelectValue placeholder="Not Tipi" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-border">
                                                    <SelectItem value="quick">Düşünce</SelectItem>
                                                    <SelectItem value="quote">Alıntı</SelectItem>
                                                    <SelectItem value="insight">Analiz</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_spoiler"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border-none bg-rose-500/5 px-4 py-2 ring-1 ring-rose-500/10">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-rose-500" />
                                                <Label className="text-xs font-bold uppercase tracking-wider text-rose-600">Spoiler</Label>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-rose-500"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <SendHorizonal className="h-5 w-5" />
                                        <span>Kaydet</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

