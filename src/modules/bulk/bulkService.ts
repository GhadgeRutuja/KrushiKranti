import api from '../../services/api';
import type {
    BulkProduct,
    BulkProductFormData,
    NegotiationConversation,
    NegotiationMessage,
    DealOffer,
    DealOfferFormData,
} from './types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ── Bulk Products ───────────────────────────────────────────────────────────

export async function fetchBulkProducts(): Promise<BulkProduct[]> {
    const res = await api.get<ApiResponse<BulkProduct[]>>('/bulk-products');
    return res.data.data;
}

export async function fetchMyBulkProducts(): Promise<BulkProduct[]> {
    const res = await api.get<ApiResponse<BulkProduct[]>>('/bulk-products/my-products');
    return res.data.data;
}

export async function createBulkProduct(data: BulkProductFormData): Promise<BulkProduct> {
    const res = await api.post<ApiResponse<BulkProduct>>('/bulk-products', data);
    return res.data.data;
}

export async function updateBulkProduct(id: number, data: BulkProductFormData): Promise<BulkProduct> {
    const res = await api.put<ApiResponse<BulkProduct>>(`/bulk-products/${id}`, data);
    return res.data.data;
}

export async function deleteBulkProduct(id: number): Promise<void> {
    await api.delete(`/bulk-products/${id}`);
}

// ── Negotiations ────────────────────────────────────────────────────────────

export async function startNegotiation(bulkProductId: number): Promise<NegotiationConversation> {
    const res = await api.post<ApiResponse<NegotiationConversation>>('/negotiations/start', {
        bulkProductId,
    });
    return res.data.data;
}

export async function fetchConversations(): Promise<NegotiationConversation[]> {
    const res = await api.get<ApiResponse<NegotiationConversation[]>>('/negotiations/conversations');
    return res.data.data;
}

export async function fetchMessages(conversationId: number): Promise<NegotiationMessage[]> {
    const res = await api.get<ApiResponse<NegotiationMessage[]>>(
        `/negotiations/${conversationId}/messages`,
    );
    return res.data.data;
}

export async function sendNegotiationMessage(
    conversationId: number,
    message: string,
    messageType: string = 'TEXT',
): Promise<NegotiationMessage> {
    const res = await api.post<ApiResponse<NegotiationMessage>>('/negotiations/message', {
        conversationId,
        message,
        messageType,
    });
    return res.data.data;
}

// ── Deal Offers ─────────────────────────────────────────────────────────────

export async function createDealOffer(data: DealOfferFormData): Promise<DealOffer> {
    const res = await api.post<ApiResponse<DealOffer>>('/negotiations/deal', data);
    return res.data.data;
}

export async function respondToDeal(
    dealOfferId: number,
    action: 'ACCEPT' | 'REJECT',
): Promise<DealOffer> {
    const res = await api.post<ApiResponse<DealOffer>>('/negotiations/deal/respond', {
        dealOfferId,
        action,
    });
    return res.data.data;
}

export async function fetchDeals(conversationId: number): Promise<DealOffer[]> {
    const res = await api.get<ApiResponse<DealOffer[]>>(
        `/negotiations/${conversationId}/deals`,
    );
    return res.data.data;
}
