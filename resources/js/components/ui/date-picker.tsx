import { Popover, Transition } from '@headlessui/react';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    id?: string;
    value?: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    fromYear?: number;
    toYear?: number;
    disabled?: boolean;
    allowClear?: boolean;
    className?: string;
};

export function DatePicker({
    id,
    value,
    onChange,
    placeholder = 'Selecciona una fecha',
    fromYear,
    toYear,
    disabled,
    allowClear = true,
    className,
}: DatePickerProps) {
    const selectedDate = value ? parseISO(value) : undefined;
    const isSelectedValid = selectedDate && isValid(selectedDate);
    const formatted = isSelectedValid
        ? format(selectedDate, 'dd/MM/yyyy', { locale: es })
        : '';

    const currentYear = new Date().getFullYear();
    const calendarFromYear = fromYear ?? currentYear - 100;
    const calendarToYear = toYear ?? currentYear + 10;
    const fallbackMonth = isSelectedValid
        ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        : new Date(currentYear, new Date().getMonth(), 1);

    const [viewMonth, setViewMonth] = useState(fallbackMonth);

    useEffect(() => {
        setViewMonth(fallbackMonth);
    }, [value]);

    const monthOptions = useMemo(
        () =>
            Array.from({ length: 12 }, (_, monthIndex) => ({
                value: String(monthIndex),
                label: format(new Date(2026, monthIndex, 1), 'LLLL', { locale: es }),
            })),
        [],
    );

    const yearOptions = useMemo(
        () =>
            Array.from(
                { length: calendarToYear - calendarFromYear + 1 },
                (_, index) => String(calendarFromYear + index),
            ),
        [calendarFromYear, calendarToYear],
    );

    return (
        <Popover className="relative">
            <Popover.Button
                id={id}
                type="button"
                disabled={disabled}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-foreground shadow-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
            >
                <span className={cn(!formatted && 'text-muted-foreground')}>
                    {formatted || placeholder}
                </span>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute z-50 mt-2 w-auto rounded-xl border border-border bg-card p-0 shadow-lg">
                    <div className="flex items-center gap-2 border-b border-border px-3 py-3">
                        <Select
                            value={String(viewMonth.getMonth())}
                            onValueChange={(value) =>
                                setViewMonth(
                                    new Date(
                                        viewMonth.getFullYear(),
                                        Number(value),
                                        1,
                                    ),
                                )
                            }
                        >
                            <SelectTrigger className="h-9 min-w-32 border-border bg-card text-foreground">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={String(viewMonth.getFullYear())}
                            onValueChange={(value) =>
                                setViewMonth(
                                    new Date(Number(value), viewMonth.getMonth(), 1),
                                )
                            }
                        >
                            <SelectTrigger className="h-9 min-w-24 border-border bg-card text-foreground">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Calendar
                        mode="single"
                        month={viewMonth}
                        onMonthChange={setViewMonth}
                        selected={isSelectedValid ? selectedDate : undefined}
                        onSelect={(date) => {
                            if (!date) {
                                onChange('');
                                return;
                            }
                            setViewMonth(
                                new Date(date.getFullYear(), date.getMonth(), 1),
                            );
                            onChange(format(date, 'yyyy-MM-dd'));
                        }}
                        hideNavigation
                        fromYear={calendarFromYear}
                        toYear={calendarToYear}
                        locale={es}
                        weekStartsOn={1}
                        className="rounded-xl"
                    />
                    {allowClear && (
                        <div className="flex justify-end border-t border-border px-3 py-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => onChange('')}
                            >
                                Limpiar
                            </Button>
                        </div>
                    )}
                </Popover.Panel>
            </Transition>
        </Popover>
    );
}
