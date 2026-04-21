import { Link, router } from '@inertiajs/react';
import { Ellipsis, Eye, MessageSquare, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActionConfig = {
    label: string;
    icon?: 'view' | 'edit' | 'notes' | 'restore' | 'delete';
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
    confirm?: {
        title: string;
        description: string;
        confirmLabel?: string;
    };
};

const icons = {
    view: Eye,
    edit: Pencil,
    notes: MessageSquare,
    restore: RotateCcw,
    delete: Trash2,
};

export function TableActionMenu({ actions }: { actions: ActionConfig[] }) {
    const enabledActions = actions.filter((action) => !action.disabled);
    const [pendingAction, setPendingAction] = useState<ActionConfig | null>(
        null,
    );

    if (!enabledActions.length) {
        return <span className="text-muted-foreground">—</span>;
    }

    const handleConfirm = () => {
        if (!pendingAction) return;

        if (pendingAction.href) {
            router.visit(pendingAction.href);
        } else {
            pendingAction.onClick?.();
        }

        setPendingAction(null);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border bg-card text-muted-foreground shadow-none hover:bg-muted"
                    >
                        <Ellipsis className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {enabledActions.map((action, index) => {
                        const Icon = action.icon ? icons[action.icon] : undefined;
                        const content = (
                            <>
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{action.label}</span>
                            </>
                        );

                        return (
                            <div key={`${action.label}-${index}`}>
                                {index > 0 && action.variant === 'destructive' && (
                                    <DropdownMenuSeparator />
                                )}
                                {action.confirm ? (
                                    <DropdownMenuItem
                                        onClick={() => setPendingAction(action)}
                                        variant={action.variant}
                                    >
                                        {content}
                                    </DropdownMenuItem>
                                ) : action.href ? (
                                    <DropdownMenuItem
                                        asChild
                                        variant={action.variant}
                                    >
                                        <Link href={action.href}>{content}</Link>
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={action.onClick}
                                        variant={action.variant}
                                    >
                                        {content}
                                    </DropdownMenuItem>
                                )}
                            </div>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={pendingAction !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingAction(null);
                }}
            >
                <DialogContent className="max-w-md rounded-3xl border-sidebar/10 shadow-2xl">
                    <DialogTitle className="text-xl font-bold">{pendingAction?.confirm?.title}</DialogTitle>
                    <DialogDescription className="text-slate-500 py-2">
                        {pendingAction?.confirm?.description}
                    </DialogDescription>
                    <DialogFooter className="gap-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-xl border-border px-6">Cancelar</Button>
                        </DialogClose>
                        <Button 
                            onClick={handleConfirm}
                            className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 rounded-xl px-8 shadow-lg shadow-sidebar/20 transition-all"
                        >
                            {pendingAction?.confirm?.confirmLabel || 'Continuar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
