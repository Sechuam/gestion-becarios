import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white shadow-lg">
                <AppLogoIcon className="h-full w-full object-cover" />
            </div>
            <div className="ml-3 grid flex-1 text-left transition-all duration-300 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:hidden">
                <span className="truncate text-base leading-none font-black tracking-[0.15em] text-white uppercase drop-shadow-sm">
                    Beca<span className="text-emerald-400">Gest</span>
                </span>
                <span className="mt-1 truncate text-[9px] leading-none font-bold tracking-[0.2em] text-white/75 uppercase">
                    Management System
                </span>
            </div>
        </>
    );
}
