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
    preserveScroll?: boolean;
}

export function Pagination({ links, className, preserveScroll = true }: Props) {
    if (!links || links.length <= 3) return null; // Don't show if only one page or no pages

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {links.map((link, i) => {
                const isPrevious = link.label.includes('Previous');
                const isNext = link.label.includes('Next');

                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        preserveState
                        preserveScroll={preserveScroll}
                        className={cn(
                            'relative overflow-hidden rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all active:border-slate-400 active:bg-slate-200 active:text-slate-800',
                            link.active
                                ? 'scale-105 transform border-slate-400 bg-slate-200 text-slate-800 shadow-sm dark:border-[#3c6270] dark:bg-[#22374d] dark:text-white'
                                : isPrevious || isNext
                                  ? 'border-sidebar/20 bg-sidebar/3 text-sidebar hover:border-sidebar/40 hover:bg-sidebar/10'
                                  : 'border-sidebar/10 bg-white text-slate-600 hover:border-sidebar/40 hover:bg-slate-50',
                            !link.url && 'pointer-events-none opacity-45',
                        )}
                    >
                        {link.active && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-slate-400 dark:bg-[#5b7188]" />
                        )}
                        <span
                            dangerouslySetInnerHTML={{
                                __html: link.label
                                    .replace('Previous', 'Anterior')
                                    .replace('Next', 'Siguiente'),
                            }}
                        />
                    </Link>
                );
            })}
        </div>
    );
}
