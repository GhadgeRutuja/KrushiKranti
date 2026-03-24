import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Minus, Plus, Twitter, Facebook, Linkedin, Instagram, Star, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchProductById, clearSelectedProduct } from '../productSlice';
import { addToCart } from '../../cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../wishlist/wishlistSlice';
import type { RootState } from '../../../app/store';
import type { Review } from '../types';
import { reviewService } from '../reviewService';
import toast from 'react-hot-toast';
import { useProductLocale } from '../hooks/useProductLocale';

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#60af5a' : 'none'}
          stroke={s <= Math.round(rating) ? '#60af5a' : '#d1d5db'} strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

function StarRating({ rating, onRatingChange, size = 24 }: { rating: number; onRatingChange: (r: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button 
          key={s} 
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRatingChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star 
            size={size} 
            fill={(hovered || rating) >= s ? '#60af5a' : 'none'}
            stroke={(hovered || rating) >= s ? '#60af5a' : '#d1d5db'} 
            strokeWidth="1.5" 
          />
        </button>
      ))}
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct: product, isLoadingProduct: isLoading, error } = useAppSelector(
    (state: RootState) => state.product
  );
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const wishlistItems = useAppSelector((state: RootState) => state.wishlist?.items || []);
  const { isAuthenticated, role, user } = useAppSelector((state: RootState) => state.auth);
  const currentRole = role ?? user?.role ?? null;

  const isInCart = product ? cartItems.some((item) => item.productId === product.id) : false;
  const isInWishlist = product
    ? wishlistItems.some((item: { id: string | number }) => String(item.id) === String(product.id))
    : false;

  const { localise } = useProductLocale();
  const displayName = product ? localise(product.id, 'name', product.name) : '';
  const displayDesc = product ? localise(product.id, 'description', product.description) : '';

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setIsLoadingReviews(true);
    try {
      const data = await reviewService.getProductReviews(id);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
    return () => { dispatch(clearSelectedProduct()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id, fetchReviews]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity: quantity,
      })).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error('Please login to continue');
      navigate('/login');
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    if (!product) return;
    if (isInWishlist) {
      dispatch(removeFromWishlist(String(product.id)));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    if (currentRole !== 'user') {
      toast.error('Only customers can submit reviews');
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await reviewService.createReview({
        productId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviews(prev => [newReview, ...prev]);
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
      toast.success('Review submitted successfully!');
      // Refresh product to get updated rating
      dispatch(fetchProductById(id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayImages = product
    ? (product.images?.length
      ? product.images
      : (product.imageUrl
        ? [product.imageUrl]
        : ['https://placehold.co/720x720/e2e8f0/64748b?text=No+Image']))
    : [];
  const activeDisplayImage = displayImages[Math.min(activeImage, Math.max(displayImages.length - 1, 0))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-950">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-bg dark:bg-gray-950 gap-4">
        <p className="text-5xl">🌿</p>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product not found</h2>
        <button onClick={() => navigate('/products')} className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }

  const canWriteReview = isAuthenticated && currentRole === 'user';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-24">
          {/* Main Image Section */}
          <div className="space-y-6">
            <div className="aspect-square bg-[#F7F7F7] dark:bg-gray-900 rounded-4xl p-12 flex items-center justify-center">
              <img
                src={activeDisplayImage}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/720x720/e2e8f0/64748b?text=No+Image';
                }}
              />
            </div>
            {/* Multi-image thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-4 justify-center">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden bg-[#F7F7F7] border-2 transition-all ${activeImage === idx ? 'border-green-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details info */}
          <div className="space-y-8 py-4">
            <div className="flex items-baseline justify-between">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
              <p className="text-2xl font-bold text-green-600">₹{product.retailPrice.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <StarRow rating={product.rating} size={14} />
              <span>({product.reviewCount} Customer Review{product.reviewCount !== 1 ? 's' : ''})</span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {displayDesc}
            </p>

            <div className="flex items-center gap-6 pt-4">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Choose Quantity</span>
              <div className="flex items-center bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 py-2 text-center text-sm font-bold bg-transparent outline-none"
                />
                <div className="flex flex-col border-l border-slate-200 dark:border-slate-800">
                  <button onClick={() => setQuantity(q => q + 1)} className="px-1.5 py-0.5 hover:bg-slate-50 border-b border-slate-200 dark:border-slate-800"><Plus size={10} /></button>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-1.5 py-0.5 hover:bg-slate-50"><Minus size={10} /></button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#4CAF50] hover:bg-green-600 text-white font-bold py-4 rounded-lg text-xs tracking-widest uppercase transition-all"
              >
                {isInCart ? "Added to Cart" : "Add to cart"}
              </button>
              <button
                onClick={handleWishlist}
                className="flex-1 bg-[#F9C04D] hover:bg-yellow-500 text-white font-bold py-4 rounded-lg text-xs tracking-widest uppercase transition-all shadow-sm shadow-yellow-500/20"
              >
                {isInWishlist ? "In Wishlist" : "Add to wishlist"}
              </button>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Share with Friends</span>
              <div className="flex gap-2">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                  <button key={idx} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-600 hover:text-green-600 transition-colors">
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Long Description */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-16 mb-24">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-10">Description</h2>
          <div className="space-y-8 text-slate-500 dark:text-slate-400 text-sm leading-[1.8]">
            <p>{displayDesc}</p>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Product Reviews ({reviews.length})
            </h2>
            {canWriteReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-all"
              >
                Write a Review
              </button>
            )}
          </div>

          {isLoadingReviews ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-gray-900 rounded-xl">
              <p className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {reviews.map((rev) => (
                <div key={rev.id} className="flex gap-6 items-start p-6 bg-slate-50 dark:bg-gray-900 rounded-xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-lg">
                    <img src={`https://i.pravatar.cc/150?u=${rev.userId}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{rev.userName}</h4>
                        <StarRow rating={rev.rating} size={12} />
                      </div>
                      <span className="text-xs text-slate-500">{new Date(rev.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Write a Review</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Your Rating
                </label>
                <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full bg-slate-100 dark:bg-gray-800 border-none rounded-xl p-4 text-sm outline-none resize-none h-32 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingReview && <Loader2 size={16} className="animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
