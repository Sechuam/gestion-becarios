export function SummaryTile({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
            <p className="text-[8px] leading-none font-black tracking-widest text-sidebar uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-white">
                {value}
            </p>
        </div>
    );
}
