import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    MessageSquare,
    Send,
    Mail,
    Pencil,
    Trash2,
    Search,
    X,
    Check,
    Users,
    LogOut,
    Plus,
    Smile,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    group?: string;
};

type PracticeType = {
    id: number;
    name: string;
    color: string | null;
};

type Conversation = {
    id: number;
    other_user: UserSummary | null;
    is_group?: boolean;
    participants?: UserSummary[];
    practice_type?: PracticeType | null;
    subject?: string | null;
    last_message_at?: string | null;
    unread_count: number;
    can_reply?: boolean;
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
    edited_at?: string | null;
    is_mine: boolean;
    sender: UserSummary;
};

type Props = {
    conversations: Conversation[];
    selected_conversation: Conversation | null;
    contacts: UserSummary[];
    practice_types: PracticeType[];
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

const formatDateShort = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return new Intl.DateTimeFormat('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }
    if (days === 1) return 'Ayer';
    if (days < 7) {
        return new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(
            date,
        );
    }
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
    }).format(date);
};

const EMOJI_OPTIONS = [
    '😀',
    '😄',
    '😂',
    '😊',
    '😍',
    '😎',
    '🥳',
    '👍',
    '👏',
    '🙌',
    '💪',
    '🙏',
    '❤️',
    '🔥',
    '✨',
    '✅',
    '👀',
    '📌',
    '📚',
    '💡',
    '🚀',
    '🎯',
    '⏰',
    '☕',
];

export default function Messages({
    conversations,
    selected_conversation,
    contacts,
    practice_types,
}: Props) {
    const { data, setData, processing, reset, errors } = useForm({
        conversation_id: selected_conversation?.id ?? '',
        recipient_user_id: '',
        recipient_ids: [] as number[],
        body: '',
        practice_type_id: '',
        subject: '',
    });

    const { auth } = usePage().props as any;
    const userRoles: string[] = auth?.user?.roles ?? [];
    const isIntern = userRoles.some((r) => r === 'intern' || r === 'becario');

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [deleteModal, setDeleteModal] = useState<Message | null>(null);
    const [deleteConvModal, setDeleteConvModal] = useState<Conversation | null>(
        null,
    );
    const [editingInline, setEditingInline] = useState<number | null>(null);
    const [inlineEditBody, setInlineEditBody] = useState('');
    const [showNewGroupPanel, setShowNewGroupPanel] = useState(false);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

    const availableContacts = contacts;

    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return availableContacts.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.role?.toLowerCase().includes(q),
        );
    }, [availableContacts, searchQuery]);

    const groupedResults = useMemo(() => {
        const groups: Record<string, UserSummary[]> = {};
        filteredContacts.forEach((contact) => {
            const group = contact.group || 'Otros';
            if (!groups[group]) groups[group] = [];
            groups[group].push(contact);
        });
        return groups;
    }, [filteredContacts]);

    const allGroupedContacts = useMemo(() => {
        const groups: Record<string, UserSummary[]> = {};
        availableContacts.forEach((contact) => {
            const group = contact.group || 'Otros';
            if (!groups[group]) groups[group] = [];
            groups[group].push(contact);
        });
        return groups;
    }, [availableContacts]);

    const selectedContact = contacts.find(
        (contact) => String(contact.id) === String(data.recipient_user_id),
    );

    // Cerrar previsualización al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(e.target as Node)
            ) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setData('conversation_id', selected_conversation?.id ?? '');
    }, [selected_conversation?.id, setData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selected_conversation?.messages]);

    const selectContact = (contact: UserSummary) => {
        setData('recipient_user_id', String(contact.id));
        setData('conversation_id', '');
        setSearchQuery('');
        setShowSearchResults(false);
        setShowNewGroupPanel(false);
    };

    const clearSelectedContact = () => {
        setData('recipient_user_id', '');
        setData('practice_type_id', '');
        setData('subject', '');
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const isCreatingGroup =
            showNewGroupPanel && selectedGroupIds.length > 0;

        // Construir payload manualmente
        const payload: Record<string, any> = {
            body: data.body.trim(),
        };

        if (data.practice_type_id)
            payload.practice_type_id = data.practice_type_id;
        if (data.subject) payload.subject = data.subject;

        if (data.conversation_id && !isCreatingGroup) {
            payload.conversation_id = data.conversation_id;
            if (selectedGroupIds.length > 0) {
                payload.recipient_ids = selectedGroupIds;
            }
        } else if (isCreatingGroup) {
            payload.recipient_ids = selectedGroupIds;
        } else if (data.recipient_user_id) {
            payload.recipient_user_id = data.recipient_user_id;
        }

        router.post('/mensajes', payload, {
            preserveScroll: true,
            onSuccess: () => {
                reset(
                    'body',
                    'recipient_user_id',
                    'practice_type_id',
                    'subject',
                );
                setSelectedGroupIds([]);
                setShowNewGroupPanel(false);
            },
        });
    };

    const insertEmoji = (emoji: string) => {
        const textarea = messageTextareaRef.current;
        const start = textarea?.selectionStart ?? data.body.length;
        const end = textarea?.selectionEnd ?? data.body.length;
        const nextBody =
            data.body.slice(0, start) + emoji + data.body.slice(end);
        const nextCursorPosition = start + emoji.length;

        setData('body', nextBody);
        setShowEmojiPicker(false);

        window.requestAnimationFrame(() => {
            textarea?.focus();
            textarea?.setSelectionRange(
                nextCursorPosition,
                nextCursorPosition,
            );
        });
    };

    const openConversation = (conversationId: number) => {
        setShowNewGroupPanel(false);
        setSelectedGroupIds([]);
        setData('recipient_user_id', '');
        setData('practice_type_id', '');
        setData('subject', '');

        router.get(
            '/mensajes',
            { conversation: conversationId },
            { preserveScroll: true },
        );
    };

    const handleDeleteMessage = (message: Message) => {
        setDeleteModal(message);
    };

    const confirmDeleteMessage = () => {
        if (!deleteModal) return;
        router.delete(`/mensajes/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal(null),
        });
    };

    const handleDeleteConversation = (conv: Conversation) => {
        setDeleteConvModal(conv);
    };

    const confirmDeleteConversation = () => {
        if (!deleteConvModal) return;
        router.delete(`/mensajes/conversacion/${deleteConvModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteConvModal(null),
        });
    };

    const startInlineEdit = (message: Message) => {
        setEditingInline(message.id);
        setInlineEditBody(message.body);
    };

    const submitInlineEdit = (messageId: number) => {
        if (!inlineEditBody.trim()) return;
        router.patch(
            `/mensajes/${messageId}`,
            { body: inlineEditBody.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingInline(null);
                    setInlineEditBody('');
                },
            },
        );
    };

    const cancelInlineEdit = () => {
        setEditingInline(null);
        setInlineEditBody('');
    };

    const toggleGroupMember = (userId: number) => {
        setSelectedGroupIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId],
        );
    };

    const conversationSubject = selected_conversation?.subject;
    const conversationPracticeType = selected_conversation?.practice_type;
    const isGroupConv = selected_conversation?.is_group;
    const canReply = selected_conversation?.can_reply ?? true;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensajes" />

            <div className="flex h-[calc(100vh-8rem)] min-h-[620px] flex-col gap-4">
                <ModuleHeader
                    title="Mensajes"
                    description={
                        isIntern
                            ? 'Conversaciones con tu tutor asignado.'
                            : 'Conversaciones con uno o varios becarios.'
                    }
                    icon={<MessageSquare className="h-4 w-4" />}
                    actions={
                        <Badge variant="secondary" className="shrink-0 text-xs">
                            {conversations.length} conversaciones
                        </Badge>
                    }
                />

                <div className="app-panel flex min-h-0 flex-1 overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                        {/* Sidebar */}
                        <aside className="flex min-h-0 w-full flex-col border-b md:w-[340px] md:shrink-0 md:border-r md:border-b-0">
                            {/* Buscador con previsualización */}
                            <div
                                ref={searchRef}
                                className="relative border-b border-white/10 p-3"
                            >
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar contacto..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowSearchResults(
                                                e.target.value.trim().length >
                                                    0,
                                            );
                                        }}
                                        onFocus={() => {
                                            if (searchQuery.trim())
                                                setShowSearchResults(true);
                                        }}
                                        className="h-9 w-full rounded-lg border border-input bg-background pr-8 pl-9 text-sm ring-offset-background transition outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setShowSearchResults(false);
                                            }}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown preview */}
                                {showSearchResults && (
                                    <div className="absolute top-full right-3 left-3 z-50 mt-1 overflow-hidden rounded-lg border border-border/80 bg-card shadow-2xl">
                                        {Object.entries(groupedResults).length >
                                        0 ? (
                                            Object.entries(groupedResults).map(
                                                ([group, groupContacts]) => (
                                                    <div key={group}>
                                                        <div className="border-b border-border/40 bg-muted/40 px-3 py-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                            {group}
                                                        </div>
                                                        {groupContacts.map(
                                                            (contact) => (
                                                                <button
                                                                    key={
                                                                        contact.id
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        selectContact(
                                                                            contact,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-accent/50"
                                                                >
                                                                    <Avatar className="h-8 w-8 shrink-0">
                                                                        <AvatarImage
                                                                            src={
                                                                                contact.avatar ??
                                                                                ''
                                                                            }
                                                                        />
                                                                        <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                                                                            {initials(
                                                                                contact.name,
                                                                            )}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="min-w-0 flex-1">
                                                                        <span className="block truncate text-sm font-medium text-foreground">
                                                                            {
                                                                                contact.name
                                                                            }
                                                                        </span>
                                                                        <span className="block truncate text-xs text-muted-foreground">
                                                                            {
                                                                                contact.email
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                                                        {
                                                                            contact.role
                                                                        }
                                                                    </span>
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                                                <Search className="h-4 w-4 shrink-0" />
                                                No se encontraron contactos
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Contacto seleccionado: selector de práctica + asunto */}
                                {data.recipient_user_id && selectedContact && (
                                    <div className="mt-2 space-y-2 border-t border-white/10 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="section-kicker">
                                                Nuevo mensaje
                                            </span>
                                            <button
                                                type="button"
                                                onClick={clearSelectedContact}
                                                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-2">
                                            <Avatar className="h-6 w-6 shrink-0">
                                                <AvatarFallback className="bg-primary/10 text-[8px] font-bold text-primary">
                                                    {initials(
                                                        selectedContact.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate text-sm font-medium text-foreground">
                                                {selectedContact.name}
                                            </span>
                                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                                {selectedContact.role}
                                            </span>
                                        </div>
                                        <select
                                            value={data.practice_type_id}
                                            onChange={(e) =>
                                                setData(
                                                    'practice_type_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs ring-offset-background transition outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">
                                                Sin práctica específica
                                            </option>
                                            {practice_types.map((pt) => (
                                                <option
                                                    key={pt.id}
                                                    value={pt.id}
                                                >
                                                    {pt.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Asunto (opcional)"
                                            value={data.subject}
                                            onChange={(e) =>
                                                setData(
                                                    'subject',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs ring-offset-background transition outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                )}

                                {/* Panel de nuevo mensaje grupal */}
                                {showNewGroupPanel && (
                                    <div className="mt-2 space-y-2 border-t border-white/10 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="section-kicker">
                                                Nuevo grupo
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewGroupPanel(false);
                                                    setSelectedGroupIds([]);
                                                    setData(
                                                        'conversation_id',
                                                        selected_conversation?.id ??
                                                            '',
                                                    );
                                                }}
                                                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="max-h-[180px] space-y-1 overflow-y-auto">
                                            {availableContacts.length === 0 ? (
                                                <p className="py-4 text-center text-xs text-muted-foreground">
                                                    No hay más contactos
                                                    disponibles
                                                </p>
                                            ) : (
                                                availableContacts.map(
                                                    (contact) => (
                                                        <label
                                                            key={contact.id}
                                                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-accent/30"
                                                        >
                                                            <Checkbox
                                                                checked={selectedGroupIds.includes(
                                                                    contact.id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleGroupMember(
                                                                        contact.id,
                                                                    )
                                                                }
                                                            />
                                                            <Avatar className="h-7 w-7 shrink-0">
                                                                <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
                                                                    {initials(
                                                                        contact.name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                                                                {contact.name}
                                                            </span>
                                                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                                                {contact.role}
                                                            </span>
                                                        </label>
                                                    ),
                                                )
                                            )}
                                        </div>
                                        {selectedGroupIds.length > 0 && (
                                            <div className="space-y-2">
                                                <select
                                                    value={
                                                        data.practice_type_id
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'practice_type_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs ring-offset-background transition outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    <option value="">
                                                        Sin práctica específica
                                                    </option>
                                                    {practice_types.map(
                                                        (pt) => (
                                                            <option
                                                                key={pt.id}
                                                                value={pt.id}
                                                            >
                                                                {pt.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Asunto del grupo (opcional)"
                                                    value={data.subject}
                                                    onChange={(e) =>
                                                        setData(
                                                            'subject',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs ring-offset-background transition outline-none focus:ring-2 focus:ring-ring"
                                                />
                                                <p className="text-[10px] font-medium text-muted-foreground">
                                                    {selectedGroupIds.length}{' '}
                                                    participantes seleccionados
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selector agrupado para becarios (1:1) */}
                            {isIntern &&
                                !data.recipient_user_id &&
                                !showNewGroupPanel && (
                                    <div className="border-b border-white/10 p-3">
                                        <label className="section-kicker mb-2">
                                            Nuevo mensaje
                                        </label>
                                        {Object.entries(allGroupedContacts)
                                            .length > 0 ? (
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const contact =
                                                            contacts.find(
                                                                (c) =>
                                                                    String(
                                                                        c.id,
                                                                    ) ===
                                                                    e.target
                                                                        .value,
                                                            );
                                                        if (contact)
                                                            selectContact(
                                                                contact,
                                                            );
                                                    }
                                                }}
                                                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background transition outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="">
                                                    Seleccionar contacto
                                                </option>
                                                {Object.entries(
                                                    allGroupedContacts,
                                                ).map(
                                                    ([
                                                        group,
                                                        groupContacts,
                                                    ]) => (
                                                        <optgroup
                                                            key={group}
                                                            label={group}
                                                        >
                                                            {groupContacts.map(
                                                                (contact) => (
                                                                    <option
                                                                        key={
                                                                            contact.id
                                                                        }
                                                                        value={
                                                                            contact.id
                                                                        }
                                                                    >
                                                                        {
                                                                            contact.name
                                                                        }{' '}
                                                                        ·{' '}
                                                                        {
                                                                            contact.role
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </optgroup>
                                                    ),
                                                )}
                                            </select>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                No hay contactos disponibles
                                            </p>
                                        )}
                                    </div>
                                )}

                            {/* Botón de nuevo grupo (tutores y admins, o interns con compañeros) */}
                            {!isIntern &&
                                !data.recipient_user_id &&
                                !showNewGroupPanel && (
                                    <div className="border-b border-white/10 p-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewGroupPanel(true);
                                                setData('conversation_id', '');
                                                setData(
                                                    'recipient_user_id',
                                                    '',
                                                );
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-accent/30 hover:text-foreground"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Nuevo mensaje grupal
                                        </button>
                                    </div>
                                )}

                            {/* Lista de conversaciones */}
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="empty-state mx-3 my-4">
                                        <div className="empty-state-icon">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            No hay conversaciones todavía.
                                        </p>
                                    </div>
                                ) : (
                                    conversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            className={cn(
                                                'group relative flex border-b border-white/10 transition hover:bg-accent/40',
                                                selected_conversation?.id ===
                                                    conversation.id &&
                                                    'bg-accent/60',
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openConversation(
                                                        conversation.id,
                                                    )
                                                }
                                                className="flex min-w-0 flex-1 gap-3 p-3 pr-2 text-left"
                                            >
                                                {conversation.is_group ? (
                                                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                        <Users className="h-5 w-5" />
                                                    </div>
                                                ) : (
                                                    <Avatar className="mt-0.5 h-10 w-10 shrink-0">
                                                        <AvatarImage
                                                            src={
                                                                conversation
                                                                    .other_user
                                                                    ?.avatar ??
                                                                ''
                                                            }
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                            {initials(
                                                                conversation
                                                                    .other_user
                                                                    ?.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-semibold text-foreground">
                                                            {conversation.is_group
                                                                ? conversation.subject ||
                                                                  'Conversación grupal'
                                                                : (conversation
                                                                      .other_user
                                                                      ?.name ??
                                                                  'Usuario')}
                                                        </span>
                                                    </span>
                                                    {conversation.is_group && (
                                                        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                                                            {conversation.participants
                                                                ?.map(
                                                                    (p) =>
                                                                        p.name,
                                                                )
                                                                .join(', ')}
                                                        </span>
                                                    )}
                                                    {conversation.practice_type && (
                                                        <span className="mt-0.5 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                                            {
                                                                conversation
                                                                    .practice_type
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                                    <span className="mt-1 flex items-center gap-2">
                                                        <span className="line-clamp-1 text-xs text-muted-foreground">
                                                            {conversation
                                                                .latest_message
                                                                ?.body ??
                                                                'Sin mensajes'}
                                                        </span>
                                                        {conversation.unread_count >
                                                            0 && (
                                                            <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                                                                {
                                                                    conversation.unread_count
                                                                }
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </span>
                                            </button>
                                            <div className="flex shrink-0 flex-col items-end justify-between py-3 pr-3">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {formatDateShort(
                                                        conversation.last_message_at,
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteConversation(
                                                            conversation,
                                                        )
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 opacity-0 transition group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 focus:opacity-100 dark:hover:bg-red-900/30"
                                                    title="Salir de la conversación"
                                                    aria-label="Salir de la conversación"
                                                >
                                                    <LogOut className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </aside>

                        {/* Panel de conversación */}
                        <section className="flex min-h-0 flex-1 flex-col">
                            {selected_conversation ||
                            selectedContact ||
                            showNewGroupPanel ||
                            selectedGroupIds.length > 0 ? (
                                <>
                                    {/* Cabecera */}
                                    <div className="flex items-center gap-3 border-b border-white/10 bg-muted/20 p-4">
                                        {isGroupConv ? (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                <Users className="h-5 w-5" />
                                            </div>
                                        ) : (
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarImage
                                                    src={
                                                        (selected_conversation
                                                            ?.other_user
                                                            ?.avatar ??
                                                            selectedContact?.avatar) ||
                                                        ''
                                                    }
                                                />
                                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                    {initials(
                                                        selected_conversation
                                                            ?.other_user
                                                            ?.name ??
                                                            selectedContact?.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className="min-w-0">
                                            <h2 className="truncate text-sm font-bold text-foreground">
                                                {isGroupConv
                                                    ? selected_conversation?.subject ||
                                                      'Conversación grupal'
                                                    : (selected_conversation
                                                          ?.other_user?.name ??
                                                      selectedContact?.name ??
                                                      'Nuevo grupo')}
                                            </h2>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {isGroupConv
                                                    ? `${selected_conversation?.participants?.length ?? 0} participantes`
                                                    : (selected_conversation
                                                          ?.other_user?.email ??
                                                      selectedContact?.email)}
                                            </p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            {conversationPracticeType && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px]"
                                                >
                                                    {
                                                        conversationPracticeType.name
                                                    }
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lista de participantes en grupo */}
                                    {isGroupConv &&
                                        selected_conversation?.participants && (
                                            <div className="flex flex-wrap gap-1 border-b border-white/10 bg-accent/10 px-4 py-2">
                                                {selected_conversation.participants.map(
                                                    (p) => (
                                                        <span
                                                            key={p.id}
                                                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                                        >
                                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">
                                                                {initials(
                                                                    p.name,
                                                                )}
                                                            </span>
                                                            {p.name}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {/* Asunto */}
                                    {conversationSubject && (
                                        <div className="border-b border-white/10 bg-accent/10 px-4 py-2">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {conversationSubject}
                                            </span>
                                        </div>
                                    )}

                                    {/* Mensajes */}
                                    <div className="flex-1 space-y-3 overflow-y-auto bg-muted/15 p-4">
                                        {selectedGroupIds.length > 0 ||
                                        showNewGroupPanel ? (
                                            <div className="empty-state mx-4 my-8">
                                                <div className="empty-state-icon">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {selectedGroupIds.length > 0
                                                        ? `Enviar mensaje grupal a ${selectedGroupIds.length} personas`
                                                        : 'Selecciona participantes para el grupo'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Escribe un mensaje para
                                                    iniciar la conversación
                                                    grupal.
                                                </p>
                                            </div>
                                        ) : selected_conversation?.messages
                                              ?.length ? (
                                            selected_conversation.messages.map(
                                                (message) => (
                                                    <div
                                                        key={message.id}
                                                        className={cn(
                                                            'group flex',
                                                            message.is_mine
                                                                ? 'justify-end'
                                                                : 'justify-start',
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm shadow-sm',
                                                                message.is_mine
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'border border-border/60 bg-card text-card-foreground',
                                                            )}
                                                        >
                                                            {editingInline ===
                                                            message.id ? (
                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        value={
                                                                            inlineEditBody
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setInlineEditBody(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="min-h-[60px] w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                submitInlineEdit(
                                                                                    message.id,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                                                                        >
                                                                            <Check className="h-3 w-3" />{' '}
                                                                            Guardar
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={
                                                                                cancelInlineEdit
                                                                            }
                                                                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted/80"
                                                                        >
                                                                            <X className="h-3 w-3" />{' '}
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {isGroupConv &&
                                                                        !message.is_mine &&
                                                                        message.sender && (
                                                                            <span className="mb-1 block text-[10px] font-semibold text-indigo-500 dark:text-indigo-400">
                                                                                {
                                                                                    message
                                                                                        .sender
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    <p className="leading-relaxed break-words whitespace-pre-wrap">
                                                                        {
                                                                            message.body
                                                                        }
                                                                    </p>
                                                                    <div
                                                                        className={cn(
                                                                            'mt-1.5 flex items-center gap-2 text-[11px]',
                                                                            message.is_mine
                                                                                ? 'text-primary-foreground/70'
                                                                                : 'text-muted-foreground',
                                                                        )}
                                                                    >
                                                                        <span>
                                                                            {formatDateTime(
                                                                                message.created_at,
                                                                            )}
                                                                        </span>
                                                                        {message.edited_at && (
                                                                            <span className="italic opacity-60">
                                                                                (editado)
                                                                            </span>
                                                                        )}
                                                                        {message.read_at &&
                                                                            message.is_mine && (
                                                                                <span className="opacity-70">
                                                                                    ·
                                                                                    Leído
                                                                                </span>
                                                                            )}
                                                                    </div>
                                                                </>
                                                            )}
                                                            {message.is_mine &&
                                                                editingInline !==
                                                                    message.id && (
                                                                    <div className="mt-1 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                startInlineEdit(
                                                                                    message,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground/70 transition hover:bg-white/20 hover:text-primary-foreground"
                                                                            title="Editar mensaje"
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteMessage(
                                                                                    message,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground/70 transition hover:bg-red-500/30 hover:text-red-300"
                                                                            title="Eliminar mensaje"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="empty-state mx-4 my-8">
                                                <div className="empty-state-icon">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Empieza la conversación
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Escribe un mensaje para
                                                    iniciar el hilo.
                                                </p>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input de mensaje */}
                                    {canReply ? (
                                        <form
                                            onSubmit={submit}
                                            className="border-t border-white/10 bg-card p-4"
                                        >
                                            {data.conversation_id && (
                                                <input
                                                    type="hidden"
                                                    value={data.conversation_id}
                                                />
                                            )}
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Textarea
                                                        ref={
                                                            messageTextareaRef
                                                        }
                                                        value={data.body}
                                                        onChange={(e) =>
                                                            setData(
                                                                'body',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={
                                                            selectedGroupIds.length >
                                                            0
                                                                ? 'Escribe un mensaje para el grupo...'
                                                                : 'Escribe tu mensaje...'
                                                        }
                                                        className="min-h-12 resize-none rounded-xl border-border/80 bg-background pr-12"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Añadir emoji"
                                                        onClick={() =>
                                                            setShowEmojiPicker(
                                                                (open) =>
                                                                    !open,
                                                            )
                                                        }
                                                        className="absolute right-2 bottom-2 h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    >
                                                        <Smile className="h-4 w-4" />
                                                    </Button>
                                                    {showEmojiPicker && (
                                                        <div className="absolute right-0 bottom-12 z-20 grid w-64 grid-cols-8 gap-1 rounded-xl border border-border bg-popover p-2 shadow-xl">
                                                            {EMOJI_OPTIONS.map(
                                                                (emoji) => (
                                                                    <button
                                                                        key={
                                                                            emoji
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            insertEmoji(
                                                                                emoji,
                                                                            )
                                                                        }
                                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        !data.body.trim() ||
                                                        (!data.conversation_id &&
                                                            !data.recipient_user_id &&
                                                            selectedGroupIds.length ===
                                                                0)
                                                    }
                                                    className="h-12 shrink-0 gap-2 rounded-xl px-5 shadow-md"
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
                                    ) : (
                                        <div className="border-t border-white/10 bg-card p-4 text-sm text-muted-foreground">
                                            Esta conversación es informativa. Los
                                            becarios solo pueden responder a su
                                            tutor asignado en conversaciones
                                            individuales.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="empty-state mx-6 my-12 flex-1">
                                    <div className="empty-state-icon">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-base font-bold text-foreground">
                                        Selecciona una conversación
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Elige un contacto arriba para empezar a
                                        conversar.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Modal eliminar mensaje */}
            <Dialog
                open={deleteModal !== null}
                onOpenChange={(open) => !open && setDeleteModal(null)}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Eliminar mensaje
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que quieres eliminar este mensaje?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteModal && (
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground italic">
                            {deleteModal.body.length > 150
                                ? deleteModal.body.slice(0, 150) + '...'
                                : deleteModal.body}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal(null)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteMessage}
                            className="gap-2 rounded-xl"
                        >
                            <Trash2 className="h-4 w-4" /> Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal salir de conversación */}
            <Dialog
                open={deleteConvModal !== null}
                onOpenChange={(open) => !open && setDeleteConvModal(null)}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <LogOut className="h-5 w-5" />
                            Salir de la conversación
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que quieres salir de esta
                            conversación? Se eliminará de tu lista.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteConvModal && (
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                            <span className="font-semibold">
                                {deleteConvModal.is_group
                                    ? deleteConvModal.subject ||
                                      'Conversación grupal'
                                    : (deleteConvModal.other_user?.name ??
                                      'Conversación')}
                            </span>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConvModal(null)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteConversation}
                            className="gap-2 rounded-xl"
                        >
                            <LogOut className="h-4 w-4" /> Salir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
