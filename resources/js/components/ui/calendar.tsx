import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col gap-4 sm:flex-row',
                month: 'space-y-4',
                month_caption:
                    'relative flex items-center justify-center px-8 pt-1',
                caption_label: 'text-sm font-semibold text-foreground',
                dropdowns: 'flex items-center gap-2',
                dropdown_root: 'relative rounded-md border border-border bg-card shadow-sm',
                dropdown:
                    'h-8 rounded-md bg-transparent pl-3 pr-8 text-sm font-medium text-foreground outline-none',
                months_dropdown: 'min-w-24',
                years_dropdown: 'min-w-20',
                nav: 'flex items-center gap-1',
                button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    'absolute left-0 top-1/2 size-7 -translate-y-1/2 bg-card p-0 opacity-70 hover:opacity-100',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    'absolute right-0 top-1/2 size-7 -translate-y-1/2 bg-card p-0 opacity-70 hover:opacity-100',
                ),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday:
                    'w-9 rounded-md text-[0.8rem] font-medium text-muted-foreground',
                weeks: 'mt-2 flex flex-col gap-1',
                week: 'mt-2 flex w-full',
                day: 'size-9 p-0 text-center text-sm',
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'size-9 p-0 font-normal aria-selected:opacity-100',
                ),
                selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'bg-accent text-accent-foreground',
                outside:
                    'text-muted-foreground opacity-60 aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
                disabled: 'text-muted-foreground opacity-40',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, className, ...iconProps }) =>
                    orientation === 'left' ? (
                        <ChevronLeft className={cn('size-4', className)} {...iconProps} />
                    ) : (
                        <ChevronRight className={cn('size-4', className)} {...iconProps} />
                    ),
            }}
            {...props}
        />
    );
}

export { Calendar };
