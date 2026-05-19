import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Settings, User, Lock, ShieldCheck, Palette } from 'lucide-react';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: edit(),
        icon: User,
    },
    {
        title: 'Contraseña',
        href: editPassword(),
        icon: Lock,
    },
    {
        title: 'Doble factor',
        href: show(),
        icon: ShieldCheck,
    },
    {
        title: 'Apariencia',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="space-y-8">
            <ModuleHeader
                title="Mi cuenta"
                description="Configura tu perfil, seguridad y preferencias de apariencia."
                icon={<Settings className="h-6 w-6 text-white" />}
            />

            <div className="app-panel w-full overflow-hidden rounded-[2rem] border-2 border-sidebar/15 bg-white shadow-2xl dark:bg-slate-900">
                <div className="border-b border-sidebar/20 bg-stone-100/50 p-2 dark:bg-slate-800/50">
                    <nav
                        className="flex min-h-12 flex-wrap gap-2 bg-transparent p-0 md:grid md:grid-cols-4"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'relative flex h-10 flex-1 items-center justify-center rounded-xl border-none px-2 text-[10px] font-black tracking-[0.15em] whitespace-nowrap uppercase transition-all',
                                        active
                                            ? 'bg-gradient-to-r from-sidebar to-sidebar-accent text-white shadow-lg'
                                            : 'bg-transparent text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-300',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                                    )}
                                    <span className="truncate">
                                        {item.title}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 md:p-8">
                    <div className="animate-in duration-500 fade-in slide-in-from-bottom-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
