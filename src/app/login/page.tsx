'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Sparkles, ChevronRight, UserPlus, LogIn } from 'lucide-react'

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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const formSchema = z.object({
    email: z.string().email({
        message: 'Geçerli bir e-posta adresi giriniz.',
    }),
    password: z.string().min(6, {
        message: 'Şifre en az 6 karakter olmalıdır.',
    }),
})

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const loginForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const registerForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onLogin(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (error) {
                toast.error('Giriş başarısız', {
                    description: error.message,
                })
                return
            }

            toast.success('Giriş başarılı', {
                description: 'Kütüphanenize yönlendiriliyorsunuz...',
            })
            router.refresh()
            router.push('/dashboard')
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    async function onRegister(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error('Kayıt başarısız', {
                    description: error.message,
                })
                return
            }

            toast.success('Kayıt başarılı', {
                description: 'Lütfen e-posta adresinizi doğrulayın.',
            })
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] border bg-card/60 backdrop-blur-3xl shadow-2xl">

                {}
                <div className="hidden lg:flex relative bg-black items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        {}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-500" />
                    </div>

                    <div className="relative z-10 space-y-8 text-center max-w-sm">
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-12 transition-transform hover:rotate-0 duration-500">
                            <Sparkles className="h-10 w-10 text-black fill-current" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="font-serif text-5xl font-bold tracking-tight text-white">Arşiv Defteri</h1>
                            <p className="text-emerald-100/60 font-serif italic text-lg leading-relaxed">
                                "Her hikaye, biriktirilmeye değer."
                            </p>
                        </div>

                    </div>
                </div>

                {}
                <div className="flex flex-col p-8 md:p-16 justify-center bg-background/40">
                    <div className="mb-10 text-center lg:text-left space-y-2">
                        <h2 className="font-serif text-3xl font-bold tracking-tight">Hoş Geldiniz</h2>
                        <p className="text-muted-foreground text-sm">Medya kütüphanenizi yönetmeye hemen başlayın.</p>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 p-1.5 h-14 rounded-2xl bg-secondary mb-8">
                            <TabsTrigger value="login" className="rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Giriş Yap</TabsTrigger>
                            <TabsTrigger value="register" className="rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Kayıt Ol</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">E-posta</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                                        <Input placeholder="name@gmail.com" className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none shadow-sm ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <div className="flex items-center justify-between ml-1">
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary">Şifre</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                                        <Input type="password" placeholder="••••••••" className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none shadow-sm ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 gap-2 mt-2" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                                        Giriş Yap
                                        <ChevronRight className="h-4 w-4 opacity-50" />
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <Form {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">E-posta</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                                        <Input placeholder="name@gmail.com" className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none shadow-sm ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Şifre Belirleyin</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                                        <Input type="password" placeholder="••••••••" className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none shadow-sm ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 gap-2 mt-2" variant="outline" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                                        Hesap Oluştur
                                    </Button>
                                    <p className="text-[10px] text-center text-primary font-bold uppercase tracking-wider animate-pulse">
                                        Lütfen e-posta adresinizi doğrulayın
                                    </p>
                                    <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-8">
                                        Kayıt olarak kullanım şartlarını ve gizlilik politikasını kabul etmiş sayılırsınız.
                                    </p>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
