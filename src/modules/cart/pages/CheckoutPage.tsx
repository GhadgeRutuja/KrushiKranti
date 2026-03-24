import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Truck, Loader2, CheckCircle, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { clearCart } from '../cartSlice';
import toast from 'react-hot-toast';
import { initializeRazorpayPayment } from '../../../services/PaymentService';
import { createPaymentOrder, verifyPayment, resetPaymentState } from '../../payment/paymentSlice';
import { createOrder } from '../../orders/orderSlice';

const checkoutSchema = z.object({
    fullName: z.string().min(3, 'Please enter your full name'),
    email: z.string().min(1, 'Please enter email').email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    address: z.string().min(10, 'Please enter your full address'),
    city: z.string().min(2, 'Please enter city'),
    state: z.string().min(2, 'Please enter state'),
    zipCode: z.string().min(6, 'Please enter a valid ZIP code'),
    paymentMethod: z.enum(['card', 'upi', 'cod']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;
export function CheckoutPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items, subtotal } = useAppSelector((state) => state.cart);
    const { user } = useAppSelector((state) => state.auth);
    const { paymentLoading, orderId } = useAppSelector((state) => state.payment);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shouldRedirectToCart, setShouldRedirectToCart] = useState(false);

    // Handle redirect to cart if no items (using useEffect to avoid render-time navigation)
    useEffect(() => {
        if (items.length === 0 && !isSuccess) {
            setShouldRedirectToCart(true);
        }
    }, [items.length, isSuccess]);

    useEffect(() => {
        if (shouldRedirectToCart) {
            navigate('/cart');
        }
    }, [shouldRedirectToCart, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: 'upi',
            fullName: user?.name || '',
            email: user?.email || '',
        },
    });

    const onSubmit = async (data: CheckoutFormData) => {
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        const orderData = {
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            shippingAddress: data.address,
            shippingCity: data.city,
            shippingState: data.state,
            shippingPincode: data.zipCode,
            customerPhone: data.phone,
            paymentMethod: data.paymentMethod,
        };

        try {
            if (data.paymentMethod === 'cod') {
                await dispatch(createOrder(orderData)).unwrap();
                setIsSuccess(true);
                dispatch(clearCart());
                toast.success('Order placed successfully!');
                return;
            }

            // Step 1: Create only the Razorpay order; DB orders are created after verification.
            const paymentOrderResult = await dispatch(createPaymentOrder(orderData)).unwrap();
            const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SOIVBnOF5D2L0j';

            // Step 2: Open Razorpay checkout
            await initializeRazorpayPayment({
                key: rzpKey,
                amount: paymentOrderResult.amount,
                currency: paymentOrderResult.currency,
                name: 'KrushiKranti',
                description: 'Order Payment',
                order_id: paymentOrderResult.razorpayOrderId,
                prefill: {
                    name: data.fullName,
                    email: data.email,
                    contact: data.phone,
                },
                theme: {
                    color: '#16a34a',
                },
                handler: async (response: any) => {
                    // Step 3: Verify payment; backend will create DB orders only after success.
                    const verificationResult = await dispatch(verifyPayment(response)).unwrap();
                    if (verificationResult.success) {
                        setIsSuccess(true);
                        dispatch(clearCart());
                        toast.success('Payment successful and order placed!');
                    }
                },
                modal: {
                    ondismiss: () => {
                        dispatch(resetPaymentState());
                        toast.error('Payment cancelled');
                    }
                }
            });
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Unable to complete your payment. Please try again.';
            toast.error(errorMessage);
            dispatch(resetPaymentState());
        }
    };

    // Show loading state while redirecting
    if (shouldRedirectToCart) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-900">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-900 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card max-w-md w-full text-center py-12"
                >
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="text-primary-600" size={80} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Order Confirmed!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Thank you for your purchase. Your order is being processed and will be shipped soon.
                    </p>
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl mb-8">
                        <p className="text-primary-700 dark:text-primary-400 font-medium">
                            Order ID: {orderId || `#ORD-${Math.floor(Math.random() * 1000000)}`}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/orders')}
                        className="btn-primary w-full py-3"
                    >
                        View My Orders
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-soft-bg dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
                    <button
                        onClick={() => navigate('/cart')}
                        className="text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-2 hover:underline"
                    >
                        <ShoppingBag size={20} />
                        Back to Cart
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-6">
                                <Truck className="text-primary-600" size={24} />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input {...register('fullName')} className="input-field" placeholder="John Doe" />
                                    {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input {...register('phone')} className="input-field" placeholder="+91 9876543210" />
                                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <textarea {...register('address')} className="input-field h-24 resize-none" placeholder="123 Street Name, Area" />
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input {...register('city')} className="input-field" placeholder="Mumbai" />
                                    {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                    <input {...register('state')} className="input-field" placeholder="Maharashtra" />
                                    {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                                    <input {...register('zipCode')} className="input-field" placeholder="400001" />
                                    {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-6">
                                <CreditCard className="text-primary-600" size={24} />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Method</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                                    <input {...register('paymentMethod')} type="radio" value="card" className="w-5 h-5 text-primary-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">Credit / Debit Card</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Secure payment via Stripe</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                                    <input {...register('paymentMethod')} type="radio" value="upi" className="w-5 h-5 text-primary-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">UPI / Net Banking</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Fast payment via Razorpay</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                                    <input {...register('paymentMethod')} type="radio" value="cod" className="w-5 h-5 text-primary-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">Cash on Delivery</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded-md" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.productName}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-primary-600">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                                    <span>Total</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={paymentLoading}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                            >
                                {paymentLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Processing...
                                    </>
                                ) : (
                                    <>Complete Purchase</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
