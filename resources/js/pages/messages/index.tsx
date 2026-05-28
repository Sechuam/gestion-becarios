import { Head, router, useForm } from '@inertiajs/react';
import { MessageSquare, Send, UserRound } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types/navigation';

type UserSummary = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
};

type Conversation = {
    id: number;
    other_user: UserSummary;
    last_message_at?: string | null;
    unread_count: number;
    latest_message?: {
        body: string;
        sender_name?: string | null;
        created_at?: string | null;
    } | null;
    messages?: Message[];
};

type Message = {
    id: number;
    body: string;
    created_at: string;
    read_at?: string | null;
    is_mine: boolean;
    sender: UserSummary;
};

type Props = {
    conversations: Conversation[];
    selected_conversation: Conversation | null;
    contacts: UserSummary[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mensajes', href: '/mensajes' },
];

const initials = (name?: string | null) =>
    (name || 'U')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const formatDateTime = (value?: string | null) => {
    if (!value) return '';

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

export default function Messages({
    conversations,
    selected_conversation,
    contacts,
}: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        conversation_id: selected_conversation?.id ?? '',
        recipient_user_id: '',
        body: '',
    });

    const availableContacts = useMemo(() => {
        const activeIds = new Set(
            conversations.map((conversation) => conversation.other_user.id),
        );

        return contacts.filter((contact) => !activeIds.has(contact.id));
    }, [contacts, conversations]);

    const selectedContact = contacts.find(
        (contact) => String(contact.id) === String(data.recipient_user_id),
    );

    useEffect(() => {
        setData('conversation_id', selected_conversation?.id ?? '');
    }, [selected_conversation?.id, setData]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post('/mensajes', {
            preserveScroll: true,
            onSuccess: () => reset('body', 'recipient_user_id'),
        });
    };

    const openConversation = (conversationId: number) => {
        router.get(
            '/mensajes',
            { conversation: conversationId },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensajes" />

            <div className="flex h-[calc(100vh-8rem)] min-h-[620px] flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Mensajes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Conversaciones entre becarios y tutores asignados.
                        </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                        {conversations.length} conversaciones
                    </Badge>
                </div>

                <div className="grid min-h-0 flex-1 overflow-hidden rounded-lg border bg-background md:grid-cols-[340px_1fr]">
                    <aside className="min-h-0 border-b md:border-r md:border-b-0">
                        <div className="border-b p-3">
                            <label
                                htmlFor="recipient"
                                className="mb-2 block text-xs font-medium text-muted-foreground"
                            >
                                Nuevo mensaje
                            </label>
                            <select
                                id="recipient"
                                value={data.recipient_user_id}
                                onChange={(event) => {
                                    setData('recipient_user_id', event.target.value);
                                    setData('conversation_id', '');
                                }}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Seleccionar contacto</option>
                                {availableContacts.map((contact) => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.name} · {contact.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="h-full overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
                                    <MessageSquare className="h-8 w-8" />
                                    No hay conversaciones todavía.
                                </div>
                            ) : (
                                conversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => openConversation(conversation.id)}
                                        className={cn(
                                            'flex w-full gap-3 border-b p-3 text-left transition hover:bg-muted/60',
                                            selected_conversation?.id ===
                                                conversation.id && 'bg-muted',
                                        )}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    conversation.other_user.avatar ?? ''
                                                }
                                            />
                                            <AvatarFallback>
                                                {initials(
                                                    conversation.other_user.name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-medium">
                                                    {conversation.other_user.name}
                                                </span>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        conversation.last_message_at,
                                                    )}
                                                </span>
                                            </span>
                                            <span className="mt-1 flex items-center gap-2">
                                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                                    {conversation.latest_message
                                                        ?.body ?? 'Sin mensajes'}
                                                </span>
                                                {conversation.unread_count > 0 && (
                                                    <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
                                                        {
                                                            conversation.unread_count
                                                        }
                                                    </Badge>
                                                )}
                                            </span>
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    <section className="flex min-h-0 flex-col">
                        {selected_conversation || selectedContact ? (
                            <>
                                <div className="flex items-center gap-3 border-b p-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={
                                                (selected_conversation?.other_user
                                                    .avatar ??
                                                    selectedContact?.avatar) ||
                                                ''
                                            }
                                        />
                                        <AvatarFallback>
                                            {initials(
                                                selected_conversation?.other_user
                                                    .name ?? selectedContact?.name,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-semibold">
                                            {selected_conversation?.other_user
                                                .name ?? selectedContact?.name}
                                        </h2>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {selected_conversation?.other_user
                                                .email ?? selectedContact?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto bg-muted/25 p-4">
                                    {selected_conversation?.messages?.length ? (
                                        selected_conversation.messages.map(
                                            (message) => (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        'flex',
                                                        message.is_mine
                                                            ? 'justify-end'
                                                            : 'justify-start',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-sm',
                                                            message.is_mine
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'border bg-background',
                                                        )}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {message.body}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                'mt-1 text-[11px]',
                                                                message.is_mine
                                                                    ? 'text-primary-foreground/75'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {formatDateTime(
                                                                message.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                                            <UserRound className="h-8 w-8" />
                                            Empieza la conversación escribiendo
                                            un mensaje.
                                        </div>
                                    )}
                                </div>

                                <form
                                    onSubmit={submit}
                                    className="border-t bg-background p-4"
                                >
                                    <input
                                        type="hidden"
                                        value={data.conversation_id}
                                    />
                                    <div className="flex gap-3">
                                        <Textarea
                                            value={data.body}
                                            onChange={(event) =>
                                                setData('body', event.target.value)
                                            }
                                            placeholder="Escribe tu mensaje..."
                                            className="min-h-12 resize-none"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing || !data.body.trim()
                                            }
                                            className="h-12 shrink-0"
                                        >
                                            <Send className="h-4 w-4" />
                                            Enviar
                                        </Button>
                                    </div>
                                    {errors.body && (
                                        <p className="mt-2 text-sm text-destructive">
                                            {errors.body}
                                        </p>
                                    )}
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                                <MessageSquare className="h-10 w-10" />
                                <div>
                                    <h2 className="text-base font-medium text-foreground">
                                        Selecciona una conversación
                                    </h2>
                                    <p className="mt-1 text-sm">
                                        Elige un contacto o abre un hilo
                                        existente para enviar mensajes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
