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

            <div className="app-panel w-full overflow-hidden border-2 border-sidebar/15 shadow-2xl rounded-[2rem] bg-white dark:bg-slate-900">
                <div className="border-b border-sidebar/20 bg-stone-100/50 dark:bg-slate-800/50 p-2">
                    <nav
                        className="flex flex-wrap md:grid md:grid-cols-4 gap-2 bg-transparent p-0 min-h-12"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            return (
                                <Link 
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        "relative h-10 flex flex-1 items-center justify-center rounded-xl border-none px-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                                        active 
                                            ? "bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-lg" 
                                            : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                                    )}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 md:p-8">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
