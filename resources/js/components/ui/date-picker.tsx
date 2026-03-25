import { Popover, Transition } from '@headlessui/react';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Fragment } from 'react';
import { DayPicker } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

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

    return (
        <Popover className="relative">
            <Popover.Button
                id={id}
                type="button"
                disabled={disabled}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground shadow-sm transition-colors',
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
                <Popover.Panel className="absolute z-50 mt-2 w-auto rounded-md border border-border bg-card p-3 shadow-lg">
                    <DayPicker
                        mode="single"
                        selected={isSelectedValid ? selectedDate : undefined}
                        onSelect={(date) => {
                            if (!date) {
                                onChange('');
                                return;
                            }
                            onChange(format(date, 'yyyy-MM-dd'));
                        }}
                        captionLayout="dropdown"
                        fromYear={calendarFromYear}
                        toYear={calendarToYear}
                        locale={es}
                        weekStartsOn={1}
                    />
                    {allowClear && (
                        <div className="mt-2 flex justify-end">
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
