export type MessageType = 'text' | 'price_offer' | 'system';
export type ConversationStatus = 'active' | 'agreed' | 'rejected';

export interface PriceOffer {
    productName: string;
    offeredPrice: number;
    unit: string;
    quantity: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    /** If farmer/agent countered: the counter price */
    counterPrice?: number;
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
    type: MessageType;
    priceOffer?: PriceOffer;
    timestamp: string;
    isRead: boolean;
}

export interface Participant {
    id: string;
    name: string;
    role: 'farmer' | 'wholesaler' | 'admin' | 'agent';
    isOnline: boolean;
}

export interface BulkOrder {
    id: string;
    conversationId: string;
    productName: string;
    quantity: number;
    unit: string;
    agreedPrice: number;
    totalValue: number;
    farmerId: string;
    farmerName: string;
    agentId: string;
    agentName: string;
    status: 'negotiated' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
    createdAt: string;
}

export interface Conversation {
    id: string;
    participants: Participant[];
    lastMessage?: Message;
    unreadCount: number;
    status: ConversationStatus;
    /** product being negotiated */
    productContext?: string;
    productId?: string;
}

export interface ChatState {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    messages: Message[];
    bulkOrders: BulkOrder[];
    isLoading: boolean;
    error: string | null;
    isTyping: boolean;
}
