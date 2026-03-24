import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Send, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchProducts } from '../../product/productSlice';
import { sendBulkRequest, fetchRequests } from '../wholesalerSlice';

export function BulkRequestsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { products, isLoading: productsLoading } = useAppSelector((state) => state.product);
  const { requests, isSubmitting, isLoading: requestsLoading } = useAppSelector((state) => state.wholesaler);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleSendRequest = async (product: typeof products[0]) => {
    const quantity = quantities[product.id];
    if (!quantity || quantity <= 0) {
      toast.error(t('wholesaler.invalid_quantity'));
      return;
    }

    try {
      await dispatch(
        sendBulkRequest({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          farmerName: product.farmerName,
          quantity,
          unit: product.unit,
          pricePerUnit: product.wholesalePrice,
        })
      ).unwrap();
      toast.success(t('wholesaler.request_sent'));
      setQuantities((prev) => ({ ...prev, [product.id]: 0 }));
    } catch {
      toast.error(t('wholesaler.request_failed'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-orange-500" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const isLoading = productsLoading || requestsLoading;

  if (isLoading && products.length === 0 && requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('wholesaler.bulk_requests_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('wholesaler.bulk_requests_desc')}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 px-1 font-medium transition-colors ${activeTab === 'browse'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {t('wholesaler.tab_browse')}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${activeTab === 'requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {t('wholesaler.tab_my_requests')}
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {requests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Browse Products Tab */}
        {activeTab === 'browse' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('wholesaler.by_farmer')} {product.farmerName}
                      </p>
                    </div>
                    {product.organic && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                        {t('wholesaler.organic')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('wholesaler.wholesale_price')}
                      </p>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        ₹{product.wholesalePrice}/{product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('wholesaler.available')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.stock} {product.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantities[product.id] || ''}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      placeholder={`${t('wholesaler.qty_placeholder')} (${product.unit})`}
                      className="flex-1 input-field py-2"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendRequest(product)}
                      disabled={isSubmitting || !quantities[product.id]}
                      className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                    </motion.button>
                  </div>

                  {quantities[product.id] > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t('wholesaler.total_label')}: ₹{(quantities[product.id] * product.wholesalePrice).toLocaleString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="mx-auto text-gray-400 mb-4" size={64} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('wholesaler.no_requests_title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('wholesaler.no_requests_desc')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={request.productImage}
                          alt={request.productName}
                          className="w-full sm:w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {request.productName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('wholesaler.from_farmer')}: {request.farmerName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <span
                                className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadge(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('wholesaler.quantity_label')}: </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {request.quantity} {request.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('wholesaler.price_label')}: </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                ₹{request.pricePerUnit}/{request.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('wholesaler.total_label')}: </span>
                              <span className="font-bold text-primary-600 dark:text-primary-400">
                                ₹{request.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {t('wholesaler.requested_on')} {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
