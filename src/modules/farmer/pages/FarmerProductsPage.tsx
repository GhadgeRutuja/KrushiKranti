import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiInboxLine,
  RiAlertLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchFarmerProducts, deleteProduct } from '../farmerSlice';

export function FarmerProductsPage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.farmer);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFarmerProducts());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error((error as Error).message || 'Unable to delete product');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Active
          </span>
        );
      case 'SOLD_OUT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            Sold Out
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Inactive
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your product listings ({products.length} total)
            </p>
          </div>
          <Link
            to="/farmer/products/add"
            className="btn-primary inline-flex items-center gap-2"
          >
            <RiAddLine size={20} />
            Add Product
          </Link>
        </motion.div>

        {/* Products Grid/Table */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <RiInboxLine className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first product to the marketplace
            </p>
            <Link to="/farmer/products/add" className="btn-primary">
              Add Your First Product
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Retail Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Wholesale Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0] || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=No+Img'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </p>
                              {product.organic && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  🌿 Organic
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-gray-600 dark:text-gray-400">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          ₹{product.retailPrice}/{product.unit}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          ₹{product.wholesalePrice}/{product.unit}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-medium ${product.quantity < 50
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-900 dark:text-white'
                              }`}
                          >
                            {product.quantity} {product.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(product.status || 'ACTIVE')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/farmer/products/edit/${product.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <RiEditLine size={18} />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <RiDeleteBinLine size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex gap-4">
                      <img
                        src={product.images[0] || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=No+Img'}
                        alt={product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {product.category}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {product.organic && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                                Organic
                              </span>
                            )}
                            {getStatusBadge(product.status || 'ACTIVE')}
                          </div>
                        </div>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            ₹<span className="text-gray-900 dark:text-white font-medium">{product.retailPrice}</span>
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Stock: <span className="text-gray-900 dark:text-white font-medium">{product.quantity}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/farmer/products/edit/${product.id}`}
                        className="flex-1 btn-outline text-center flex items-center justify-center gap-2 py-2"
                      >
                        <RiEditLine size={16} />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="flex-1 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <RiDeleteBinLine size={16} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <RiAlertLine className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Delete Product
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this product? All associated data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
