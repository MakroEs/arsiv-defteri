'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, User, Mail, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'

const profileSchema = z.object({
    full_name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
    avatar_url: z.string().optional(),
})

export default function SettingsPage() {
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [email, setEmail] = useState<string>('')
    const [currentName, setCurrentName] = useState<string>('')

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: '',
            avatar_url: '',
        },
    })

    // Fetch user profile
    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                setEmail(user.email || '')

                const { data } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setCurrentName(data.full_name || '')
                    form.reset({
                        full_name: data.full_name || '',
                        avatar_url: data.avatar_url || '',
                    })
                }
            }
        }
        getProfile()
    }, [supabase, form])

    async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to avatars bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update form and database
            form.setValue('avatar_url', publicUrl)

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                })

            if (updateError) throw updateError

            toast.success('Profil fotoğrafı güncellendi')
            window.dispatchEvent(new Event('profile-updated'))
        } catch (error: any) {
            console.error('Avatar upload error:', error)
            toast.error('Fotoğraf yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
        } finally {
            setIsUploading(false)
        }
    }

    async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        if (!userId) return
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: values.full_name,
                    avatar_url: values.avatar_url,
                    updated_at: new Date().toISOString(),
                })

            if (error) throw error

            setCurrentName(values.full_name)
            toast.success('Profil başarıyla güncellendi')
            window.dispatchEvent(new Event('profile-updated'))
        } catch (error: any) {
            console.error('Profile update error details:', error)
            const message = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
            toast.error('Profil güncellenirken hata oluştu: ' + message)
        } finally {
            setIsLoading(false)
        }
    }

    const initials = getInitials(currentName || email?.split('@')[0] || 'U')
    const avatarColor = getAvatarColor(currentName || email || 'User')
    const avatarUrl = form.watch('avatar_url')

    return (
        <div className="space-y-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-serif">Profil Ayarları</h2>
                <p className="text-muted-foreground mt-1">Hesap bilgilerinizi güncelleyin.</p>
            </div>

            {/* Profile Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
                {/* Avatar Section */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8 flex flex-col items-center">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                            {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            ) : null}
                            <AvatarImage src={avatarUrl || ''} alt={currentName} />
                            <AvatarFallback className={`text-white font-serif text-2xl ${avatarColor}`}>
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onAvatarChange}
                            disabled={isUploading}
                        />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold font-serif text-slate-900 dark:text-slate-50">
                        {currentName || 'Kullanıcı'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>

                {/* Form Section */}
                <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            Ad Soyad
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Adınız Soyadınız"
                                                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email - Read Only */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    E-posta
                                </label>
                                <Input
                                    value={email}
                                    disabled
                                    className="h-11 bg-slate-100 dark:bg-slate-800 text-muted-foreground cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez.</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading || isUploading}
                                    className="px-8"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Değişiklikleri Kaydet
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
