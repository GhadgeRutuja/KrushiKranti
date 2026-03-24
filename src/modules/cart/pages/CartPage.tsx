import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { removeCartItem, updateQuantity, clearCart, fetchCart } from '../cartSlice';
import type { RootState } from '../../../app/store';
import toast from 'react-hot-toast';

export function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, subtotal, itemCount } = useAppSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await dispatch(updateQuantity({ productId, quantity: newQuantity })).unwrap();
    } catch (error) {
      const message = (error as Error).message || 'Unable to update item quantity';
      toast.error(message);
      if (message === 'Please login to continue') {
        navigate('/login');
      }
    }
  };

  const handleRemoveItem = async (productId: string, name: string) => {
    try {
      await dispatch(removeCartItem(productId)).unwrap();
      toast.success(`${name} removed from cart`);
    } catch (error) {
      const message = (error as Error).message || 'Unable to remove item from cart';
      toast.error(message);
      if (message === 'Please login to continue') {
        navigate('/login');
      }
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    try {
      await dispatch(clearCart()).unwrap();
      toast.success('Cart cleared');
    } catch (error) {
      const message = (error as Error).message || 'Unable to clear your cart';
      toast.error(message);
      if (message === 'Please login to continue') {
        navigate('/login');
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-soft-bg dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBag className="mx-auto text-gray-300 dark:text-gray-600 mb-6" size={80} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added any products yet.
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-bg dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 font-medium"
            >
              <Trash2 size={18} />
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="flex flex-col sm:flex-row gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div className="w-full sm:w-32 h-32 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link to={`/products/${item.productId}`} className="hover:text-green-600 transition-colors">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {item.productName}
                            </h3>
                          </Link>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Unit: {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ₹{(item.wholesalePrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveItem(item.productId, item.productName)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card sticky top-24"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-primary-600 dark:text-primary-400">Free</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block w-full">
                  <button className="w-full btn-primary py-3 text-lg">
                    Proceed to Checkout
                  </button>
                </Link>

                <Link
                  to="/products"
                  className="block text-center mt-4 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
