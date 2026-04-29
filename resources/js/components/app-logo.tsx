import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm shrink-0">
                <AppLogoIcon className="h-full w-full object-cover" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden transition-all duration-300">
                <span className="mb-0.5 truncate leading-tight font-black uppercase tracking-tight text-slate-800 dark:text-white">
                    BecaGest
                </span>
            </div>
        </>
    );
}
