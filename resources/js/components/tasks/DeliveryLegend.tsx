import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEGEND_ITEMS = [
    {
        dotClass: 'bg-emerald-500',
        label: 'Completada',
        description: 'Finalizada antes de la fecha límite',
    },
    {
        dotClass: 'bg-orange-500',
        label: 'Tarde',
        description: 'Finalizada después de la fecha límite',
    },
    {
        dotClass: 'bg-rose-500',
        label: 'No entregada',
        description: 'Vencida y aún sin finalizar',
    },
    {
        dotClass: 'bg-amber-400',
        label: 'Pronto',
        description: 'Vence en los próximos 3 días',
    },
    {
        dotClass: 'bg-sidebar/30',
        label: 'Pendiente',
        description: 'En curso, vence en más de 3 días',
    },
];

export function DeliveryLegend() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex justify-end">
            <div className="inline-block rounded-xl border border-sidebar/10 bg-white shadow-sm dark:bg-slate-900/60 overflow-hidden transition-all">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Info className="h-3.5 w-3.5 text-sidebar/50" />
                    <span>Ver leyenda de entrega</span>
                    {open
                        ? <ChevronUp className="h-3.5 w-3.5" />
                        : <ChevronDown className="h-3.5 w-3.5" />
                    }
                </button>

                {open && (
                    <div className="border-t border-sidebar/10 px-3 py-2 flex flex-wrap gap-x-5 gap-y-1.5">
                        {LEGEND_ITEMS.map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className={cn('h-2 w-2 rounded-full shrink-0', item.dotClass)} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                    {item.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    — {item.description}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
