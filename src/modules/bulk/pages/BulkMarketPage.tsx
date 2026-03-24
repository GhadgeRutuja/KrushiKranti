import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchBulkProducts } from '../bulkSlice';
import { startNegotiation } from '../negotiationSlice';
import {
    RiMapPinLine,
    RiScalesLine,
    RiPriceTag3Line,
    RiStore2Line,
    RiRefreshLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { EmptyState, ErrorState, ProductCardSkeleton } from '../../../shared/components/ui';

export function BulkMarketPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { products, isLoading, error } = useAppSelector((state) => state.bulk);
    const { user } = useAppSelector((state) => state.auth);
    const { isSubmitting } = useAppSelector((state) => state.negotiation);

    const loadProducts = () => {
        dispatch(fetchBulkProducts());
    };

    useEffect(() => {
        loadProducts();
    }, [dispatch]);

    const handleNegotiate = async (bulkProductId: number) => {
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }
        if (user.role !== 'wholesaler') {
            toast.error('Only wholesalers can negotiate bulk deals');
            return;
        }
        try {
            const result = await dispatch(startNegotiation(bulkProductId)).unwrap();
            navigate(`/wholesaler/chat/${result.id}`);
        } catch (err) {
            toast.error((err as string) || 'Unable to start negotiation');
        }
    };

    return (
        <div className="min-h-screen bg-soft-bg px-4 py-8 dark:bg-gray-950 md:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-gray-900 md:p-8">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white md:text-3xl">
                        Bulk Marketplace
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 md:text-base">
                        Browse bulk agricultural products from verified farmers and negotiate for better rates.
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                        {products.length} live bulk listings
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={loadProducts} />
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState
                        icon={<RiStore2Line size={28} />}
                        title="No bulk products available yet"
                        message="New wholesale listings will appear here. Please check back soon."
                        actionLabel="Refresh"
                        onAction={loadProducts}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {products.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-gray-900"
                            >
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-40 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-40 items-center justify-center bg-slate-100 dark:bg-slate-800">
                                        <RiStore2Line className="text-slate-400" size={28} />
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="line-clamp-1 text-base font-semibold text-slate-900 dark:text-white">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                by {product.farmerName}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                                            {product.status}
                                        </span>
                                    </div>

                                    {product.description && (
                                        <p className="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="flex items-center gap-2">
                                            <RiScalesLine className="text-slate-400" size={16} />
                                            <span><strong>{product.quantity}</strong> units</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <RiPriceTag3Line className="text-slate-400" size={16} />
                                            <span>From <strong>₹{product.minimumPrice}</strong></span>
                                        </p>
                                        {product.location && (
                                            <p className="flex items-center gap-2">
                                                <RiMapPinLine className="text-slate-400" size={16} />
                                                <span className="line-clamp-1">{product.location}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => handleNegotiate(product.id)}
                                            disabled={isSubmitting || !user || user.role !== 'wholesaler'}
                                            className="flex-1 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                                        >
                                            {isSubmitting ? 'Starting...' : 'Negotiate'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={loadProducts}
                                            className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                            aria-label="Refresh list"
                                        >
                                            <RiRefreshLine size={16} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
