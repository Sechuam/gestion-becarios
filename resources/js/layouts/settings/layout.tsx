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

            <div className="space-y-6">
                <nav
                    className="flex overflow-x-auto space-x-1 border-b border-sidebar/10 pb-px"
                    aria-label="Settings"
                >
                    {sidebarNavItems.map((item, index) => {
                        const active = isCurrentOrParentUrl(item.href);
                        return (
                            <Link 
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2",
                                    active 
                                        ? "border-primary text-primary bg-primary/5" 
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                                )}
                            >
                                {item.icon && (
                                    <item.icon className="h-4 w-4" />
                                )}
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
            </div>
        </div>
    );
}
