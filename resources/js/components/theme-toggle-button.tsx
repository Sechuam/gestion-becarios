import { Moon, Sun } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type Props = ComponentPropsWithoutRef<'button'>;

export default function ThemeToggleButton({ className, ...props }: Props) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const Icon = isDark ? Sun : Moon;

    return (
        <button
            type="button"
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className={cn(
                'inline-flex size-10 items-center justify-center rounded-full border border-[#2b3036] bg-[#2b3036] text-white shadow-sm backdrop-blur transition hover:border-[#172033] hover:bg-[#172033] hover:text-white focus-visible:ring-4 focus-visible:ring-[#4e7f78]/25 focus-visible:outline-none dark:border-white/80 dark:bg-white/90 dark:text-[#172033] dark:hover:border-white dark:hover:bg-white dark:hover:text-[#172033] dark:focus-visible:ring-[#9fc6bf]/25',
                className,
            )}
            {...props}
        >
            <Icon className="size-4" />
        </button>
    );
}
