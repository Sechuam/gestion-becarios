import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface LinkProp {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: LinkProp[];
    className?: string;
}

export function Pagination({ links, className }: Props) {
    if (!links || links.length <= 3) return null; // Don't show if only one page or no pages

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {links.map((link, i) => {
                const isPrevious = link.label.includes('Previous');
                const isNext = link.label.includes('Next');
                
                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        preserveState
                        className={cn(
                            "relative rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all overflow-hidden",
                            link.active
                                ? 'scale-105 transform border-none bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-md shadow-sidebar/20'
                                : (isPrevious || isNext)
                                    ? 'border-sidebar/20 bg-sidebar/[0.03] text-sidebar hover:bg-sidebar/10 hover:border-sidebar/40'
                                    : 'border-sidebar/10 bg-white text-slate-600 hover:border-sidebar/40 hover:bg-slate-50',
                            !link.url && 'pointer-events-none opacity-45'
                        )}
                    >
                        {link.active && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                        )}
                        <span dangerouslySetInnerHTML={{
                            __html: link.label
                                .replace('Previous', 'Anterior')
                                .replace('Next', 'Siguiente'),
                        }} />
                    </Link>
                );
            })}
        </div>
    );
}
