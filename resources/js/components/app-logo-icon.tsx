import { GraduationCap } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className="flex items-center justify-center rounded-md bg-black p-1 text-white dark:bg-white dark:text-black">
            <GraduationCap className="h-full w-full" />
        </div>
    );
}