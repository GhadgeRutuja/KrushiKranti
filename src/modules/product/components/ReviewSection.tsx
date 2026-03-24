import { useState } from 'react';
import { useAppSelector } from '../../../shared/hooks';
import type { Review } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ReviewSectionProps {
    reviews: Review[];
    productId: string;
}

function StarSelector({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className="p-0.5"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24"
                        fill={s <= (hover || rating) ? '#f59e0b' : 'none'}
                        stroke={s <= (hover || rating) ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hover || rating]}
            </span>
        </div>
    );
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width={size} height={size} viewBox="0 0 24 24"
                    fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
                    stroke={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
            ))}
        </div>
    );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="w-6 text-right text-slate-500">{label}★</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 text-slate-400">{count}</span>
        </div>
    );
}

export function ReviewSection({ reviews: initialReviews, productId: _productId }: ReviewSectionProps) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const avgRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    const hasUserReviewed = user ? reviews.some((r) => r.userId === String(user.id)) : false;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) { toast.error('Please write a review'); return; }
        if (hasUserReviewed) { toast.error('You have already reviewed this product'); return; }

        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            const newReview: Review = {
                id: 'rev_' + Date.now(),
                userId: user ? String(user.id) : 'anonymous',
                userName: user?.name || 'Anonymous',
                rating,
                comment,
                createdAt: new Date().toISOString(),
            };
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            toast.success('Review submitted successfully!');
        } catch {
            toast.error('Unable to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    Customer Reviews
                    <span className="ml-2 text-sm font-normal text-slate-500">({reviews.length})</span>
                </h2>

                {/* Rating Summary */}
                {reviews.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                        {/* Big Number */}
                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl p-6 min-w-30">
                            <p className="text-5xl font-extrabold text-slate-900 dark:text-white">{avgRating.toFixed(1)}</p>
                            <StarDisplay rating={avgRating} size={18} />
                            <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
                        </div>

                        {/* Distribution Bars */}
                        <div className="flex-1 space-y-2 justify-center flex flex-col">
                            {distribution.map(({ star, count }) => (
                                <RatingBar key={star} label={String(star)} count={count} total={reviews.length} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Review Form */}
                {isAuthenticated ? (
                    hasUserReviewed ? (
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 text-sm text-green-700 dark:text-green-400">
                            ✓ You have already reviewed this product. Thank you!
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Write a Review</p>

                            <div className="mb-4">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Your Rating</label>
                                <StarSelector rating={rating} onChange={setRating} />
                            </div>

                            <div className="mb-4">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Your Review</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    rows={4}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">{comment.length}/500 characters</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !comment.trim()}
                                className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )
                ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            <Link to="/login" className="text-green-600 font-bold">Login</Link> to write a review
                        </p>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.userName}</p>
                                        <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <StarDisplay rating={review.rating} size={13} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{review.rating}/5</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}

                    {reviews.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-3">⭐</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No reviews yet</p>
                            <p className="text-xs text-slate-500">Be the first to review this product!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
