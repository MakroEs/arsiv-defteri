import Image from 'next/image'
import Link from 'next/link'
import { Item } from '@/types'
import { Star, Play, Clock, CheckCircle2, XCircle, RefreshCw, Tv, Film, Book, Gamepad2, Mic, Camera, BookOpenText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ItemCardProps {
    item: Item
    className?: string
}

const statusConfig = {
    planned: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Clock, label: 'Planlandı' },
    in_progress: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: Play, label: 'Devam Ediyor' },
    completed: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2, label: 'Bitti' },
    dropped: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle, label: 'Bırakıldı' },
    rewatch: { color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: RefreshCw, label: 'Tekrar' },
}

const typeConfig = {
    series: { icon: Tv, label: 'Dizi' },
    movie: { icon: Film, label: 'Film' },
    book: { icon: Book, label: 'Kitap' },
    manga: { icon: BookOpenText, label: 'Manga' },
    game: { icon: Gamepad2, label: 'Oyun' },
    podcast: { icon: Mic, label: 'Podcast' },
    documentary: { icon: Camera, label: 'Belgesel' },
}

export function ItemCard({ item, className }: ItemCardProps) {
    const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.planned
    const StatusIcon = status.icon

    const type = typeConfig[item.type as keyof typeof typeConfig] || { icon: Tv, label: item.type }
    const TypeIcon = type.icon

    return (
        <Link
            href={`/i/${item.id}`}
            className={cn(
                "group relative block w-full transition-all duration-500",
                className
            )}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2rem] bg-muted shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:ring-2 group-hover:ring-primary/50">
                {item.cover_url ? (
                    <Image
                        src={item.cover_url}
                        alt={item.title}
                        fill
                        className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        priority={false}
                    />
                ) : (
                    <Image
                        src="/1.jpg"
                        alt={item.title}
                        fill
                        className="object-cover object-center grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                {/* Top Left: Status */}
                <div className="absolute left-3 top-3 z-10">
                    <Badge variant="outline" className={cn("flex items-center gap-1 border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                </div>

                {/* Top Right: Type & Favorite */}
                <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 items-end">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-lg">
                        <TypeIcon className="h-3.5 w-3.5" />
                    </div>
                    {item.is_favorite && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                            <Star className="h-3.5 w-3.5 fill-current" />
                        </div>
                    )}
                </div>

                {/* Bottom Info (Peek on Hover) */}
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="bg-white/10 text-white border-none text-[8px] font-bold backdrop-blur-sm">
                            {type.label}
                        </Badge>
                        {item.rating && (
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-500 border-none text-[8px] font-bold backdrop-blur-sm">
                                <Star className="h-2 w-2 fill-current mr-1" />
                                {item.rating}/10
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-1">
                <h3 className="font-serif text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                    {item.title}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    {type.label}
                </p>
            </div>
        </Link>
    )
}
