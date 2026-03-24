import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { updateProduct, fetchFarmerProducts } from '../farmerSlice';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../types';

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, isSubmitting, isLoading } = useAppSelector((state) => state.farmer);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchFarmerProducts());
    }
  }, [dispatch, products.length]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return;
    try {
      await dispatch(updateProduct({ id, data })).unwrap();
      toast.success('Product updated successfully!');
      navigate('/farmer/products');
    } catch (error) {
      toast.error((error as Error).message || 'Unable to update product');
    }
  };

  if (isLoading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="w-full px-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <Link to="/farmer/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const initialData: Partial<ProductFormData> = product
    ? {
      name: product.name,
      category: product.category,
      description: product.description,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      quantity: product.quantity,
      unit: product.unit,
      organic: product.organic,
      imagePreview: product.images[0],
      imagePreviews: product.images,
      imageUrl: product.images[0],
      imageUrls: product.images,
    }
    : {};

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
          Edit Product
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update your product details below.
        </p>
      </motion.div>

      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Product"
        cancelTo="/farmer/products"
      />
    </div>
  );
}
