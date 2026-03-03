import * as React from 'react';
 
type ToastVariant = 'default' | 'destructive';
 
export type Toast = {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
 
type State = {
    toasts: Toast[];
};
 
type ToastAction =
    | { type: 'ADD_TOAST'; toast: Toast }
    | { type: 'UPDATE_TOAST'; toast: Partial<Toast> & { id: string } }
    | { type: 'DISMISS_TOAST'; toastId?: string }
    | { type: 'REMOVE_TOAST'; toastId?: string };
 
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000;
 
function reducer(state: State, action: ToastAction): State {
    switch (action.type) {
        case 'ADD_TOAST': {
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            };
        }
        case 'UPDATE_TOAST': {
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t,
                ),
            };
        }
        case 'DISMISS_TOAST': {
            const { toastId } = action;
            return {
                ...state,
                toasts: state.toasts.map((t) => {
                    if (toastId === undefined || t.id === toastId) {
                        return { ...t, open: false };
                    }
                    return t;
                }),
            };
        }
        case 'REMOVE_TOAST': {
            const { toastId } = action;
            return {
                ...state,
                toasts:
                    toastId === undefined
                        ? []
                        : state.toasts.filter((t) => t.id !== toastId),
            };
        }
        default:
            return state;
    }
}
 
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
 
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
 
function dispatch(action: ToastAction) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => listener(memoryState));
}
 
type ToastInput = Omit<Toast, 'id'>;
 
export function toast(input: ToastInput) {
    const id = genId();
 
    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });
 
    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...input,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open) dismiss();
            },
        },
    });
 
    return {
        id,
        dismiss,
        update: (toast: Partial<ToastInput>) =>
            dispatch({ type: 'UPDATE_TOAST', toast: { ...toast, id } }),
    };
}
 
export function useToast() {
    const [state, setState] = React.useState<State>(memoryState);
 
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);
 
    const dismiss = React.useCallback((toastId?: string) => {
        dispatch({ type: 'DISMISS_TOAST', toastId });
 
        setTimeout(() => {
            dispatch({ type: 'REMOVE_TOAST', toastId });
        }, TOAST_REMOVE_DELAY);
    }, []);
 
    return {
        ...state,
        toast,
        dismiss,
    };
}
