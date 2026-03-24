import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2, RefreshCw, Truck, Phone, Mail, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { adminService } from '../adminService';
import type { DeliveryBoy, CreateDeliveryBoyRequest } from '../types';
import toast from 'react-hot-toast';

export function ManageDeliveryBoysPage() {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    total: 0,
  });

  // Form state
  const [formData, setFormData] = useState<CreateDeliveryBoyRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeliveryBoys = useCallback(async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllDeliveryBoys(page, 10);
      setDeliveryBoys(response.deliveryBoys);
      setPagination({
        page,
        totalPages: response.totalPages,
        total: response.totalElements,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch delivery boys';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryBoys(0);
  }, [fetchDeliveryBoys]);

  const handleToggleStatus = async (id: number, currentEnabled: boolean) => {
    setIsActing(id);
    try {
      const updated = await adminService.setDeliveryBoyStatus(id, !currentEnabled);
      setDeliveryBoys((prev) => prev.map((db) => (db.id === id ? updated : db)));
      toast.success(`Delivery boy ${!currentEnabled ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsActing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this delivery boy?')) return;

    setIsActing(id);
    try {
      await adminService.deleteDeliveryBoy(id);
      setDeliveryBoys((prev) => prev.filter((db) => db.id !== id));
      toast.success('Delivery boy deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsActing(null);
    }
  };

  const handleCreateDeliveryBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newDeliveryBoy = await adminService.createDeliveryBoy(formData);
      setDeliveryBoys((prev) => [newDeliveryBoy, ...prev]);
      setShowModal(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      toast.success('Delivery boy created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create delivery boy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDeliveryBoys = deliveryBoys.filter((db) => {
    const fullName = `${db.firstName} ${db.lastName}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      db.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.phone.includes(searchQuery)
    );
  });

  if (isLoading && deliveryBoys.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (error && deliveryBoys.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchDeliveryBoys(0)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="text-green-600" size={28} />
            Delivery Boys
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage delivery personnel ({pagination.total} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDeliveryBoys(pagination.page)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus size={18} />
            Add Delivery Boy
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50 dark:bg-green-900/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Delivery Boy
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Contact
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Total Orders
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Pending
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Completed
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredDeliveryBoys.map((db) => (
              <tr key={db.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold">
                      {db.firstName.charAt(0)}{db.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {db.firstName} {db.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {db.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Mail size={12} /> {db.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Phone size={12} /> {db.phone}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {db.totalAssignedOrders}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {db.pendingDeliveries}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {db.completedDeliveries}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      db.enabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {db.enabled ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(db.id, db.enabled)}
                      disabled={isActing === db.id}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      title={db.enabled ? 'Deactivate' : 'Activate'}
                    >
                      {isActing === db.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : db.enabled ? (
                        <ToggleRight size={20} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={20} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(db.id)}
                      disabled={isActing === db.id}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredDeliveryBoys.map((db) => (
          <div
            key={db.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold">
                  {db.firstName.charAt(0)}{db.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {db.firstName} {db.lastName}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      db.enabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {db.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1 mb-3 text-sm text-gray-600 dark:text-gray-300">
              <p className="flex items-center gap-2"><Mail size={14} /> {db.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {db.phone}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <p className="font-semibold text-gray-900 dark:text-white">{db.totalAssignedOrders}</p>
                <p className="text-gray-500 dark:text-gray-400">Total</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                <p className="font-semibold text-amber-600">{db.pendingDeliveries}</p>
                <p className="text-gray-500 dark:text-gray-400">Pending</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                <p className="font-semibold text-green-600">{db.completedDeliveries}</p>
                <p className="text-gray-500 dark:text-gray-400">Done</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleStatus(db.id, db.enabled)}
                disabled={isActing === db.id}
                className={`flex-1 py-2 rounded text-sm font-medium disabled:opacity-50 ${
                  db.enabled
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-green-600 text-white'
                }`}
              >
                {isActing === db.id ? (
                  <Loader2 size={14} className="animate-spin inline" />
                ) : db.enabled ? (
                  'Deactivate'
                ) : (
                  'Activate'
                )}
              </button>
              <button
                onClick={() => handleDelete(db.id)}
                disabled={isActing === db.id}
                className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-red-500 text-sm font-medium disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveryBoys.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Truck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No delivery boys found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchDeliveryBoys(pagination.page - 1)}
            disabled={pagination.page === 0 || isLoading}
            className="px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchDeliveryBoys(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1 || isLoading}
            className="px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Delivery Boy</h2>
            </div>
            <form onSubmit={handleCreateDeliveryBoy} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone (10 digits)
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                  placeholder="********"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
