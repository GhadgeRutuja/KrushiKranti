// Types for the Bulk Marketplace Negotiation module

export interface BulkProduct {
    id: number;
    farmerId: number;
    farmerName: string;
    name: string;
    description: string;
    quantity: number;
    minimumPrice: number;
    location: string;
    imageUrl?: string;
    status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
    createdAt: string;
}

export interface NegotiationConversation {
    id: number;
    bulkProductId: number;
    bulkProductName: string;
    farmerId: number;
    farmerName: string;
    wholesalerId: number;
    wholesalerName: string;
    status: 'ACTIVE' | 'AGREED' | 'REJECTED' | 'CLOSED';
    createdAt: string;
}

export interface NegotiationMessage {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    message: string;
    messageType: 'TEXT' | 'PRICE_OFFER' | 'DEAL_ACCEPTED' | 'DEAL_REJECTED' | 'ATTACHMENT';
    status: 'SENT' | 'DELIVERED' | 'SEEN';
    createdAt: string;
}

export interface DealOffer {
    id: number;
    conversationId: number;
    createdById: number;
    createdByName: string;
    pricePerUnit: number;
    quantity: number;
    totalPrice: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
}

export interface BulkProductFormData {
    name: string;
    description: string;
    quantity: number;
    minimumPrice: number;
    location: string;
    imageUrl?: string;
}

export interface DealOfferFormData {
    conversationId: number;
    pricePerUnit: number;
    quantity: number;
}
