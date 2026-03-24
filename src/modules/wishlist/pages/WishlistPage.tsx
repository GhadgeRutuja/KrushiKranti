import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { removeFromWishlist } from '../wishlistSlice';
import { addToCart } from '../../cart/cartSlice';
import toast from 'react-hot-toast';
import type { Product } from '../../product/types';

export function WishlistPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const rawItems = useAppSelector((state) => state.wishlist?.items);
    const cartItems = useAppSelector((state) => state.cart?.items ?? []);

    const items: Product[] = Array.isArray(rawItems) ? rawItems : [];

    const handleAddToCart = async (product: Product) => {
        const alreadyInCart = cartItems.some((i) => i.productId === product.id);
        if (alreadyInCart) {
            toast.error(`${product.name} is already in your cart`);
            return;
        }
        try {
            await dispatch(
                addToCart({
                    productId: product.id,
                    quantity: 1,
                })
            ).unwrap();
            toast.success(`${product.name} added to cart`);
        } catch {
            toast.error('Please login to continue');
            navigate('/login');
        }
    };

    const handleRemove = (id: string | number, name: string) => {
        dispatch(removeFromWishlist(id));
        toast.success(`${name} removed from wishlist`);
    };

    // ── Empty state ─────────────────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-soft-bg dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Heart size={36} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {t('wishlist.empty_title')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                        {t('wishlist.empty_desc')}
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg"
                    >
                        <ArrowLeft size={16} />
                        {t('wishlist.browse_products')}
                    </Link>
                </div>
            </div>
        );
    }

    // ── Wishlist grid ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-soft-bg dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Heart size={22} className="text-red-500 fill-red-500" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('wishlist.title')}
                        </h1>
                        <span className="text-sm text-slate-400 font-normal">
                            ({items.length} {items.length === 1 ? t('wishlist.item') : t('wishlist.items')})
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((product) => {
                        const isInCart = cartItems.some((i) => String(i.productId) === String(product.id));
                        const productImage = product.images?.[0] ?? product.imageUrl ?? '';
                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
                            >
                                {/* Image */}
                                <Link
                                    to={`/products/${product.id}`}
                                    className="block relative"
                                >
                                    <div className="h-48 bg-slate-50 dark:bg-slate-800 overflow-hidden">
                                        {productImage ? (
                                            <img
                                                src={productImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Heart size={40} />
                                            </div>
                                        )}
                                    </div>
                                    {product.organic && (
                                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest bg-green-600 text-white px-2 py-0.5 rounded-sm">
                                            {t('products.filter_organic')}
                                        </span>
                                    )}
                                </Link>

                                {/* Info */}
                                <div className="flex-1 flex flex-col p-4">
                                    <Link to={`/products/${product.id}`} className="flex-1">
                                        <p className="text-[9px] font-bold capitalize tracking-widest text-slate-400 mb-1">
                                            {product.category}
                                        </p>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 leading-snug">
                                            {product.name}
                                        </h3>
                                        {product.farmerName && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
                                                by {product.farmerName}
                                            </p>
                                        )}
                                        <p className="text-base font-extrabold text-green-700 dark:text-green-400">
                                            ₹{product.retailPrice ?? 0}
                                            <span className="text-xs font-normal text-slate-400 ml-0.5">
                                                / {product.unit ?? 'kg'}
                                            </span>
                                        </p>
                                    </Link>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isInCart}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white disabled:opacity-60"
                                        >
                                            <ShoppingCart size={14} />
                                            {isInCart ? t('cart.in_cart') : t('cart.add_to_cart')}
                                        </button>
                                        <button
                                            onClick={() => handleRemove(product.id, product.name)}
                                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-red-500"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
