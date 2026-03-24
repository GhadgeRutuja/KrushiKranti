import { motion } from 'framer-motion';
import { RiArrowLeftLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { addProduct } from '../farmerSlice';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../types';

export function AddProductPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isSubmitting } = useAppSelector((state) => state.farmer);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await dispatch(addProduct(data)).unwrap();
      toast.success('Product added successfully!');
      navigate('/farmer/products');
    } catch (error) {
      toast.error((error as Error).message || 'Unable to add product');
    }
  };

  return (
    <div className="w-full px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          to="/farmer/products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 mb-4 font-medium transition-colors"
        >
          <RiArrowLeftLine size={16} />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Add New Product
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fill in all required fields below to list your product on KrushiKranti.
        </p>
      </motion.div>

      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Product"
        cancelTo="/farmer/products"
      />
    </div>
  );
}
