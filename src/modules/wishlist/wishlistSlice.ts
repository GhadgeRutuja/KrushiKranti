import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../product/types';

interface WishlistState {
    items: Product[];
}

type WishlistPayload = Partial<Product> & {
    id?: string | number;
    productId?: string | number;
    image?: string;
    price?: number;
};

function normalizeWishlistProduct(input: WishlistPayload): Product | null {
    const rawId = input.id ?? input.productId;
    if (rawId === undefined || rawId === null) return null;

    const id = String(rawId);
    const name = String(input.name ?? '').trim();
    if (!name) return null;

    const primaryImage =
        (Array.isArray(input.images) && input.images.length > 0 ? input.images[0] : undefined) ??
        input.image ??
        input.imageUrl ??
        '';

    return {
        id,
        name,
        description: input.description ?? '',
        category: (input.category as Product['category']) ?? 'other',
        retailPrice: Number(input.retailPrice ?? input.price ?? 0),
        wholesalePrice: Number(input.wholesalePrice ?? input.retailPrice ?? input.price ?? 0),
        unit: input.unit ?? 'kg',
        quantity: Number(input.quantity ?? 0),
        imageUrl: input.imageUrl ?? primaryImage,
        farmerId: input.farmerId ?? '',
        farmerName: input.farmerName ?? '',
        location: input.location ?? '',
        organic: Boolean(input.organic),
        status: input.status ?? 'available',
        createdAt: input.createdAt ?? '',
        updatedAt: input.updatedAt ?? '',
        stock: Number(input.stock ?? input.quantity ?? 0),
        images: Array.isArray(input.images) && input.images.length > 0 ? input.images : (primaryImage ? [primaryImage] : []),
        rating: Number(input.rating ?? 0),
        reviewCount: Number(input.reviewCount ?? 0),
        reviews: input.reviews,
    };
}

const loadWishlist = (): Product[] => {
    try {
        const saved = localStorage.getItem('wishlist');
        if (!saved) return [];

        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((item) => normalizeWishlistProduct(item as WishlistPayload))
            .filter((item): item is Product => item !== null);
    } catch {
        return [];
    }
};

const initialState: WishlistState = {
    items: loadWishlist(),
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action: PayloadAction<WishlistPayload>) => {
            const normalized = normalizeWishlistProduct(action.payload);
            if (!normalized) return;

            if (!state.items.find((item) => String(item.id) === String(normalized.id))) {
                state.items.push(normalized);
                localStorage.setItem('wishlist', JSON.stringify(state.items));
            }
        },
        removeFromWishlist: (state, action: PayloadAction<string | number>) => {
            state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
            localStorage.setItem('wishlist', JSON.stringify(state.items));
        },
        clearWishlist: (state) => {
            state.items = [];
            localStorage.removeItem('wishlist');
        },
    },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
