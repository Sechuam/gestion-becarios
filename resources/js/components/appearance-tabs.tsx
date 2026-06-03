import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Claro' },
        { value: 'dark', icon: Moon, label: 'Oscuro' },
        { value: 'system', icon: Monitor, label: 'Sistema' },
    ];

    return (
        <div
            className={cn(
                'grid w-full grid-cols-1 gap-2 rounded-xl border border-sidebar/10 bg-slate-50/80 p-1.5 shadow-sm sm:grid-cols-3 dark:border-[#2c465c] dark:bg-[#142235]',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex h-10 items-center justify-center rounded-lg px-3.5 text-[10px] font-black tracking-widest uppercase transition-all',
                        appearance === value
                            ? 'border border-slate-400 bg-slate-200 text-slate-800 shadow-sm dark:border-[#3c6270] dark:bg-[#22374d] dark:text-white'
                            : 'text-slate-500 hover:bg-white hover:text-slate-800 dark:text-[#8fa3b6] dark:hover:bg-slate-800 dark:hover:text-white',
                    )}
                >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}
