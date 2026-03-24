import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Search, CheckCheck, Check, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import {
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
    updatePriceOfferStatus,
    setTyping,
} from '../chatSlice';
import type { Conversation, Message, PriceOffer } from '../types';

// ─── Mock data generators ────────────────────────────────────────────────────
function makeFarmerConversations(userId: string): Conversation[] {
    return [
        {
            id: 'conv-f1',
            participants: [{ id: 'agent-1', name: 'Suresh (Agent)', role: 'agent', isOnline: true }],
            status: 'active',
            productContext: 'Alphonso Mangoes',
            unreadCount: 1,
            lastMessage: {
                id: 'lm1', senderId: 'agent-1', senderName: 'Suresh (Agent)',
                receiverId: userId, text: 'Can we discuss pricing for your mangoes?',
                type: 'text', timestamp: new Date(Date.now() - 1800000).toISOString(), isRead: false,
            },
        },
        {
            id: 'conv-f2',
            participants: [{ id: 'agent-2', name: 'Meena (Agent)', role: 'agent', isOnline: false }],
            status: 'agreed',
            productContext: 'Basmati Rice',
            unreadCount: 0,
            lastMessage: {
                id: 'lm2', senderId: userId, senderName: 'You',
                receiverId: 'agent-2', text: 'Deal accepted!',
                type: 'text', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true,
            },
        },
    ];
}

function makeWholesalerConversations(userId: string): Conversation[] {
    return [
        {
            id: 'conv-w1',
            participants: [{ id: 'farmer-1', name: 'Ramesh Kumar (Farmer)', role: 'farmer', isOnline: true }],
            status: 'active',
            productContext: 'Fresh Tomatoes',
            unreadCount: 2,
            lastMessage: {
                id: 'lmw1', senderId: 'farmer-1', senderName: 'Ramesh Kumar',
                receiverId: userId, text: 'I have 500kg available this week.',
                type: 'text', timestamp: new Date(Date.now() - 600000).toISOString(), isRead: false,
            },
        },
        {
            id: 'conv-w2',
            participants: [{ id: 'farmer-2', name: 'Prakash Deshmukh (Farmer)', role: 'farmer', isOnline: false }],
            status: 'active',
            productContext: 'Alphonso Mangoes',
            unreadCount: 0,
            lastMessage: {
                id: 'lmw2', senderId: userId, senderName: 'You',
                receiverId: 'farmer-2', text: 'Send me your best rate for 2 dozen.',
                type: 'text', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true,
            },
        },
    ];
}

function makeInitialMessages(convId: string, userId: string): Message[] {
    const map: Record<string, Message[]> = {
        'conv-f1': [
            {
                id: 'f1-m1', senderId: 'agent-1', senderName: 'Suresh (Agent)', receiverId: userId, text: 'Hello! I am interested in your Alphonso Mangoes for bulk supply.', type: 'text', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true
            },
            { id: 'f1-m2', senderId: userId, senderName: 'You', receiverId: 'agent-1', text: 'Yes, I have around 200 dozens available this season.', type: 'text', timestamp: new Date(Date.now() - 3000000).toISOString(), isRead: true },
            { id: 'f1-m3', senderId: 'agent-1', senderName: 'Suresh (Agent)', receiverId: userId, text: 'Can we discuss pricing for your mangoes?', type: 'text', timestamp: new Date(Date.now() - 1800000).toISOString(), isRead: false },
        ],
        'conv-f2': [
            { id: 'f2-m1', senderId: 'agent-2', senderName: 'Meena (Agent)', receiverId: userId, text: 'Hi! Looking to source Basmati Rice from you.', type: 'text', timestamp: new Date(Date.now() - 172800000).toISOString(), isRead: true },
            {
                id: 'f2-m2', senderId: 'agent-2', senderName: 'Meena (Agent)', receiverId: userId, text: 'Here is our offer for 500kg.', type: 'price_offer', priceOffer: { productName: 'Basmati Rice', offeredPrice: 95, unit: 'kg', quantity: 500, status: 'accepted' }, timestamp: new Date(Date.now() - 90000000).toISOString(), isRead: true
            },
            { id: 'f2-m3', senderId: userId, senderName: 'You', receiverId: 'agent-2', text: 'Deal accepted!', type: 'text', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
        ],
        'conv-w1': [
            { id: 'w1-m1', senderId: 'farmer-1', senderName: 'Ramesh Kumar', receiverId: userId, text: 'Good morning! I have fresh tomatoes ready for bulk order.', type: 'text', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: true },
            { id: 'w1-m2', senderId: userId, senderName: 'You', receiverId: 'farmer-1', text: 'Great! What quantity do you have?', type: 'text', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
            { id: 'w1-m3', senderId: 'farmer-1', senderName: 'Ramesh Kumar', receiverId: userId, text: 'I have 500kg available this week.', type: 'text', timestamp: new Date(Date.now() - 600000).toISOString(), isRead: false },
            { id: 'w1-m4', senderId: 'farmer-1', senderName: 'Ramesh Kumar', receiverId: userId, text: 'Current market rate is ₹40/kg. Can you beat that?', type: 'text', timestamp: new Date(Date.now() - 500000).toISOString(), isRead: false },
        ],
        'conv-w2': [
            { id: 'w2-m1', senderId: userId, senderName: 'You', receiverId: 'farmer-2', text: 'Hello Prakash ji, I need Alphonso mangoes in bulk.', type: 'text', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: true },
            { id: 'w2-m2', senderId: userId, senderName: 'You', receiverId: 'farmer-2', text: 'Send me your best rate for 2 dozen.', type: 'text', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
        ],
    };
    return map[convId] || [];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PriceOfferCard({
    offer,
    messageId,
    isMe,
    onAccept,
    onReject,
    readOnly,
}: {
    offer: PriceOffer;
    messageId: string;
    isMe: boolean;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    readOnly?: boolean;
}) {
    const statusColors: Record<PriceOffer['status'], string> = {
        pending: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-700',
        accepted: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
        rejected: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-700',
        countered: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-700',
    };

    return (
        <div className={`rounded-xl border p-4 mt-2 ${statusColors[offer.status]}`}>
            <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-green-700 dark:text-green-400" />
                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">
                    Price Offer
                </p>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{offer.productName}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Price</p>
                    <p className="text-lg font-extrabold text-green-700 dark:text-green-400">
                        ₹{offer.offeredPrice}<span className="text-xs font-normal text-slate-400">/{offer.unit}</span>
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Qty</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{offer.quantity} {offer.unit}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        ₹{(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')}
                    </p>
                </div>
            </div>

            {offer.status === 'pending' && !isMe && !readOnly && (
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => onAccept(messageId)}
                        className="flex-1 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => onReject(messageId)}
                        className="flex-1 py-1.5 text-xs font-bold border border-red-300 text-red-600 rounded-lg"
                    >
                        Decline
                    </button>
                </div>
            )}
            {offer.status !== 'pending' && (
                <div className={`text-xs font-bold text-center py-1 rounded-lg ${offer.status === 'accepted' ? 'text-green-700 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {offer.status === 'accepted' ? '✓ Accepted — Deal Agreed' : '✕ Declined'}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface ChatPageProps {
    readOnly?: boolean;
}

export function ChatPage({ readOnly = false }: ChatPageProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { conversations, activeConversation, messages, isTyping } = useAppSelector(state => state.chat);

    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileList, setShowMobileList] = useState(true);
    const [showPriceOfferForm, setShowPriceOfferForm] = useState(false);
    const [priceOffer, setPriceOffer] = useState<Partial<PriceOffer>>({
        productName: activeConversation?.productContext || '',
        offeredPrice: 0,
        unit: 'kg',
        quantity: 100,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isAgent = user?.role === 'wholesaler' || user?.role === 'admin';
    const currentUserId = user ? String(user.id) : null;

    // Initialise mock conversations by role
    useEffect(() => {
        if (!user || conversations.length > 0) return;
        const convs = user.role === 'farmer'
            ? makeFarmerConversations(String(user.id))
            : makeWholesalerConversations(String(user.id));
        dispatch(setConversations(convs));
    }, [user, conversations.length, dispatch]);

    // Load messages when conversation changes
    useEffect(() => {
        if (!activeConversation || !currentUserId) return;
        dispatch(setMessages(makeInitialMessages(activeConversation.id, currentUserId)));
    }, [activeConversation?.id, currentUserId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Sync productContext to price offer form
    useEffect(() => {
        if (activeConversation?.productContext) {
            setPriceOffer(prev => ({ ...prev, productName: activeConversation.productContext }));
        }
    }, [activeConversation?.productContext]);

    const handleSelectConversation = useCallback((conv: Conversation) => {
        dispatch(setActiveConversation(conv));
        setShowMobileList(false);
        setShowPriceOfferForm(false);
    }, [dispatch]);

    const sendMessage = useCallback((msg: Message) => {
        dispatch(addMessage(msg));

        // Simulate auto-reply after 1.5s
        if (!readOnly && user) {
            dispatch(setTyping(true));
            setTimeout(() => {
                dispatch(setTyping(false));
                const otherId = activeConversation?.participants[0]?.id || 'agent-1';
                const otherName = activeConversation?.participants[0]?.name || 'Agent';
                const autoReplies = [
                    'Thanks for your message!',
                    'Let me check and get back to you.',
                    'That sounds reasonable.',
                    'Can we negotiate further?',
                    'I will confirm with my team.',
                ];
                const reply: Message = {
                    id: 'auto-' + Date.now(),
                    senderId: otherId,
                    senderName: otherName,
                    receiverId: String(user.id),
                    text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
                    type: 'text',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                };
                dispatch(addMessage(reply));
            }, 1500);
        }
    }, [dispatch, user, activeConversation, readOnly]);

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user || !activeConversation || readOnly) return;
        const msg: Message = {
            id: 'msg-' + Date.now(),
            senderId: String(user.id),
            senderName: user.name,
            receiverId: activeConversation.participants[0].id,
            text: inputText.trim(),
            type: 'text',
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        sendMessage(msg);
        setInputText('');
    };

    const handleSendPriceOffer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeConversation || readOnly) return;
        if (!priceOffer.productName || !priceOffer.offeredPrice || !priceOffer.quantity) return;

        const offer: PriceOffer = {
            productName: priceOffer.productName!,
            offeredPrice: Number(priceOffer.offeredPrice),
            unit: priceOffer.unit || 'kg',
            quantity: Number(priceOffer.quantity),
            status: 'pending',
        };
        const msg: Message = {
            id: 'offer-' + Date.now(),
            senderId: String(user.id),
            senderName: user.name,
            receiverId: activeConversation.participants[0].id,
            text: `Price offer for ${offer.productName}: ₹${offer.offeredPrice}/${offer.unit}`,
            type: 'price_offer',
            priceOffer: offer,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        sendMessage(msg);
        setShowPriceOfferForm(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            // typing indicator timeout
        }, 1000);
    };

    const handleAcceptOffer = (messageId: string) => {
        dispatch(updatePriceOfferStatus({ messageId, status: 'accepted' }));
        if (!readOnly && user && activeConversation) {
            const msg: Message = {
                id: 'acc-' + Date.now(),
                senderId: String(user.id),
                senderName: user.name,
                receiverId: activeConversation.participants[0].id,
                text: '✓ Price offer accepted! We have a deal.',
                type: 'text',
                timestamp: new Date().toISOString(),
                isRead: false,
            };
            dispatch(addMessage(msg));
        }
    };

    const handleRejectOffer = (messageId: string) => {
        dispatch(updatePriceOfferStatus({ messageId, status: 'rejected' }));
        if (!readOnly && user && activeConversation) {
            const msg: Message = {
                id: 'rej-' + Date.now(),
                senderId: String(user.id),
                senderName: user.name,
                receiverId: activeConversation.participants[0].id,
                text: 'I have declined this offer. Let us discuss further.',
                type: 'text',
                timestamp: new Date().toISOString(),
                isRead: false,
            };
            dispatch(addMessage(msg));
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.participants[0].name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const statusBadge = (status: Conversation['status']) => {
        if (status === 'agreed') return <span className="text-[9px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">AGREED</span>;
        return null;
    };

    return (
        <div className="flex bg-[#F8FAFC] dark:bg-gray-950 h-[calc(100vh-64px)] overflow-hidden">
            {/* ── LEFT: Conversation list ────────────────────── */}
            <aside className={`w-full md:w-72 lg:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-gray-900 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-base font-bold text-slate-900 dark:text-white">
                            {readOnly ? 'Chat History' : 'Messages'}
                        </h1>
                        {activeConversation?.status === 'agreed' && (
                            <span className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">DEAL AGREED</span>
                        )}
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredConversations.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">No conversations yet.</div>
                    )}
                    {filteredConversations.map(conv => {
                        const other = conv.participants[0];
                        const isActive = activeConversation?.id === conv.id;
                        return (
                            <button
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`w-full px-4 py-3.5 flex gap-3 text-left ${isActive ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                                        {other.name.charAt(0)}
                                    </div>
                                    {other.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{other.name}</p>
                                            {statusBadge(conv.status)}
                                        </div>
                                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                                            {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {conv.productContext && <span className="text-green-600 font-medium">[{conv.productContext}] </span>}
                                            {conv.lastMessage?.text || 'Start a conversation'}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="w-4 h-4 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0 ml-1">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* ── RIGHT: Chat window ─────────────────────────── */}
            <main className={`flex-1 flex flex-col overflow-hidden ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <header className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowMobileList(true)}
                                    className="md:hidden p-1 text-slate-500"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 font-bold text-sm">
                                        {activeConversation.participants[0].name.charAt(0)}
                                    </div>
                                    {activeConversation.participants[0].isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                                        {activeConversation.participants[0].name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {isTyping ? (
                                            <span className="text-green-600">typing...</span>
                                        ) : activeConversation.participants[0].isOnline ? 'Active now' : 'Last seen recently'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {activeConversation.productContext && (
                                    <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        <Tag size={11} /> {activeConversation.productContext}
                                    </span>
                                )}
                                {activeConversation.status === 'agreed' && (
                                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        ✓ Deal Agreed
                                    </span>
                                )}
                                {readOnly && (
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        READ ONLY
                                    </span>
                                )}
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {messages.map(msg => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {!isMe && (
                                            <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 font-bold text-xs mr-2 flex-shrink-0 self-end">
                                                {msg.senderName.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            {!isMe && (
                                                <p className="text-[10px] text-slate-400 mb-1 ml-1">{msg.senderName}</p>
                                            )}
                                            <div className={`rounded-2xl px-3.5 py-2.5 ${msg.type === 'price_offer'
                                                ? 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 w-64'
                                                : isMe
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700'
                                                }`}>
                                                {msg.type === 'text' && (
                                                    <p className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {msg.text}
                                                    </p>
                                                )}
                                                {msg.type === 'price_offer' && msg.priceOffer && (
                                                    <PriceOfferCard
                                                        offer={msg.priceOffer}
                                                        messageId={msg.id}
                                                        isMe={isMe}
                                                        onAccept={handleAcceptOffer}
                                                        onReject={handleRejectOffer}
                                                        readOnly={readOnly}
                                                    />
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                <span className="text-[9px] text-slate-400">{formatTime(msg.timestamp)}</span>
                                                {isMe && (msg.isRead ? <CheckCheck size={11} className="text-green-400" /> : <Check size={11} className="text-slate-400" />)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isTyping && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 text-xs font-bold">
                                        {activeConversation.participants[0].name.charAt(0)}
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Price Offer Form */}
                        {showPriceOfferForm && !readOnly && (
                            <div className="px-4 py-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-widest mb-3">
                                    Send Price Offer
                                </p>
                                <form onSubmit={handleSendPriceOffer} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Product</label>
                                            <input
                                                type="text"
                                                value={priceOffer.productName || ''}
                                                onChange={e => setPriceOffer(p => ({ ...p, productName: e.target.value }))}
                                                placeholder="Product name"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Unit</label>
                                            <select
                                                value={priceOffer.unit || 'kg'}
                                                onChange={e => setPriceOffer(p => ({ ...p, unit: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none"
                                            >
                                                <option value="kg">kg</option>
                                                <option value="dozen">dozen</option>
                                                <option value="liter">liter</option>
                                                <option value="piece">piece</option>
                                                <option value="quintal">quintal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Price (₹/{priceOffer.unit || 'kg'})</label>
                                            <input
                                                type="number"
                                                value={priceOffer.offeredPrice || ''}
                                                onChange={e => setPriceOffer(p => ({ ...p, offeredPrice: Number(e.target.value) }))}
                                                placeholder="0"
                                                min="1"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={priceOffer.quantity || ''}
                                                onChange={e => setPriceOffer(p => ({ ...p, quantity: Number(e.target.value) }))}
                                                placeholder="100"
                                                min="1"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {priceOffer.offeredPrice && priceOffer.quantity ? (
                                        <p className="text-xs text-slate-500">
                                            Total value: <strong className="text-green-700 dark:text-green-400">
                                                ₹{(Number(priceOffer.offeredPrice) * Number(priceOffer.quantity)).toLocaleString('en-IN')}
                                            </strong>
                                        </p>
                                    ) : null}

                                    <div className="flex gap-2">
                                        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white text-xs font-bold rounded-lg">
                                            Send Offer
                                        </button>
                                        <button type="button" onClick={() => setShowPriceOfferForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Input Area */}
                        {!readOnly && (
                            <footer className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                                <form onSubmit={handleSendText} className="flex items-center gap-2">
                                    {isAgent && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPriceOfferForm(v => !v)}
                                            title="Send price offer"
                                            className={`p-2.5 rounded-lg border text-xs font-bold flex-shrink-0 ${showPriceOfferForm ? 'bg-yellow-500 text-white border-yellow-500' : 'border-slate-200 dark:border-slate-700 text-yellow-600'}`}
                                        >
                                            ₹
                                        </button>
                                    )}
                                    <input
                                        type="text"
                                        placeholder={
                                            activeConversation.status === 'agreed'
                                                ? 'Deal agreed — continue chatting...'
                                                : 'Type a message...'
                                        }
                                        value={inputText}
                                        onChange={handleInputChange}
                                        className="flex-1 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className="p-2.5 bg-green-600 text-white rounded-lg disabled:opacity-40"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </footer>
                        )}
                    </>
                ) : (
                    // No conversation selected
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Select a conversation</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                            {readOnly
                                ? 'Select a conversation to view its history.'
                                : 'Choose a contact to start negotiating prices and discussing orders.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
