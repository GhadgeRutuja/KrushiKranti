import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchMyBulkProducts, createBulkProduct, deleteBulkProduct } from '../bulkSlice';
import { RiLoader4Line, RiAddLine, RiDeleteBinLine, RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import type { BulkProductFormData } from '../types';
import ImageUpload from '../../../shared/components/ImageUpload';

export function FarmerBulkProductsPage() {
    const dispatch = useAppDispatch();
    const { myProducts, isLoading, isSubmitting } = useAppSelector((state) => state.bulk);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<BulkProductFormData>({
        name: '', description: '', quantity: 0, minimumPrice: 0, location: '', imageUrl: '',
    });

    useEffect(() => {
        dispatch(fetchMyBulkProducts());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.quantity || !form.minimumPrice) {
            toast.error('Please fill required fields');
            return;
        }
        try {
            await dispatch(createBulkProduct(form)).unwrap();
            toast.success('Bulk product created!');
            setShowForm(false);
            setForm({ name: '', description: '', quantity: 0, minimumPrice: 0, location: '', imageUrl: '' });
        } catch (err) {
            toast.error((err as string) || 'Failed to create product');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this bulk product?')) return;
        try {
            await dispatch(deleteBulkProduct(id)).unwrap();
            toast.success('Product deleted');
        } catch (err) {
            toast.error((err as string) || 'Failed to delete');
        }
    };

    return (
        <div className="kk-page-surface">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Bulk Products</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Manage your bulk marketplace listings</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {showForm ? <><RiCloseLine /> Cancel</> : <><RiAddLine /> Add Bulk Product</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="kk-card-surface rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Product Banner Image</label>
                        <ImageUpload
                            onUploadSuccess={(res) => setForm({ ...form, imageUrl: res.url })}
                            onImageRemove={() => setForm({ ...form, imageUrl: '' })}
                            initialImageUrl={form.imageUrl}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Product Name *</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="e.g. Organic Basmati Rice" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-20"
                            placeholder="Describe your product..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Quantity *</label>
                        <input type="number" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Minimum Price (₹) *</label>
                        <input type="number" step="0.01" value={form.minimumPrice || ''} onChange={(e) => setForm({ ...form, minimumPrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="45.00" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Location</label>
                        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="e.g. Nashik, Maharashtra" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? 'Creating...' : 'Create Bulk Product'}
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="text-center py-16">
                    <RiLoader4Line className="animate-spin text-green-600 mx-auto" size={36} />
                </div>
            ) : myProducts.length === 0 ? (
                <div className="kk-card-surface text-center py-16 rounded-2xl">
                    <p className="text-gray-600 dark:text-gray-300">No bulk products yet. Click "Add Bulk Product" to create one.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {myProducts.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <RiLoader4Line size={24} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">{p.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {p.quantity} units • Min ₹{p.minimumPrice} • {p.location || 'No location'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                    {p.status}
                                </span>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <RiDeleteBinLine size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}
