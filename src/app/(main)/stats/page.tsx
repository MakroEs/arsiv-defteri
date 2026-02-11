'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, TrendingUp, CheckCircle2, PlayCircle, Star, Calendar, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react'
import { Item } from '@/types'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend
} from 'recharts'
import { format, subMonths, startOfMonth, isAfter } from 'date-fns'
import { tr } from 'date-fns/locale'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']

export default function StatsPage() {
    const supabase = createClient()

    const { data: stats, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')

            if (error) throw error
            const items = data as Item[]

            const total = items.length
            const completed = items.filter(i => i.status === 'completed').length
            const watching = items.filter(i => i.status === 'in_progress').length
            const planned = items.filter(i => i.status === 'planned').length

            // Average Rating
            const ratedItems = items.filter(i => i.rating !== null && i.rating !== undefined)
            const avgRating = ratedItems.length > 0
                ? (ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1)
                : '0.0'

            // Type Distribution for Pie Chart
            const typeDistData = Object.entries(
                items.reduce((acc, curr) => {
                    const typeLabels: Record<string, string> = {
                        'movie': 'Film',
                        'series': 'Dizi',
                        'book': 'Kitap',
                        'game': 'Oyun',
                        'manga': 'Manga',
                        'podcast': 'Podcast',
                        'documentary': 'Belgesel'
                    }
                    const label = typeLabels[curr.type] || curr.type
                    acc[label] = (acc[label] || 0) + 1
                    return acc
                }, {} as Record<string, number>)
            ).map(([name, value]) => ({ name, value }))

            // Status Distribution for Bar Chart
            const statusLabels: Record<string, string> = {
                'planned': 'Planlandı',
                'in_progress': 'Devam Ediyor',
                'completed': 'Tamamlandı',
                'dropped': 'Bırakıldı',
                'rewatch': 'Tekrar'
            }
            const statusDistData = Object.entries(statusLabels).map(([key, label]) => ({
                name: label,
                value: items.filter(i => i.status === key).length
            }))

            // Activity Chart (last 6 months)
            const last6Months = Array.from({ length: 6 }).map((_, i) => {
                const date = subMonths(new Date(), i)
                return {
                    month: format(date, 'MMM', { locale: tr }),
                    fullDate: startOfMonth(date),
                    count: 0
                }
            }).reverse()

            items.forEach(item => {
                const itemDate = new Date(item.created_at)
                const monthIndex = last6Months.findIndex(m =>
                    itemDate.getMonth() === m.fullDate.getMonth() &&
                    itemDate.getFullYear() === m.fullDate.getFullYear()
                )
                if (monthIndex !== -1) {
                    last6Months[monthIndex].count++
                }
            })

            return {
                total,
                completed,
                watching,
                planned,
                avgRating,
                typeDistData,
                statusDistData,
                activityData: last6Months
            }
        }
    })

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="font-serif text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">İstatistik Arşivi</h2>
                <p className="text-muted-foreground font-serif italic text-lg opacity-80">Listenizin sayısal öyküsü ve gelişiminiz.</p>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Toplam İçerik', value: stats?.total, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
                    { title: 'Tamamlanan', value: stats?.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                    { title: 'Şu an Yayında', value: stats?.watching, icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                    { title: 'Kütüphane Puanı', value: stats?.avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                ].map((metric, i) => (
                    <Card key={i} className="border-none shadow-md bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{metric.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                                <metric.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-serif tracking-tight">{metric.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Status Bar Chart */}
                <Card className="lg:col-span-4 border-none shadow-md bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-serif">Durum Analizi</CardTitle>
                        </div>
                        <CardDescription>İçeriklerinizin mevcut aşamaları.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.statusDistData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Type Pie Chart */}
                <Card className="lg:col-span-3 border-none shadow-md bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <PieChartIcon className="h-4 w-4 text-pink-500" />
                            <CardTitle className="text-lg font-serif">Tür Dağılımı</CardTitle>
                        </div>
                        <CardDescription>Kütüphane çeşitliliğiniz.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.typeDistData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.typeDistData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Chart (Time series) */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        <CardTitle className="text-lg font-serif">Arşivleme Aktivitesi</CardTitle>
                    </div>
                    <CardDescription>Son 6 ayda listeye eklenen içerik sayısı.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.activityData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Empty State / Encouragement */}
            {stats?.total === 0 && (
                <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-center dark:border-slate-800 dark:bg-slate-950/50">
                    <Calendar className="h-10 w-10 text-slate-300" />
                    <div className="space-y-1">
                        <p className="text-lg font-serif font-medium text-slate-900 dark:text-slate-50">Henüz veriniz yok</p>
                        <p className="text-sm text-slate-500">İçerik eklemeye başladıkça grafikleriniz canlanacak.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
