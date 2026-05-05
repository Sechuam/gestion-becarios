import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shrink-0 border border-white/20">
                <AppLogoIcon className="h-full w-full object-cover" />
            </div>
            <div className="ml-3 grid flex-1 text-left group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:ml-0 transition-all duration-300">
                <span className="truncate leading-none font-black uppercase tracking-[0.15em] text-white text-base drop-shadow-sm">
                    Beca<span className="text-emerald-400">Gest</span>
                </span>
                <span className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mt-1 leading-none">
                    Management System
                </span>
            </div>
        </>
    );
}
