import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";
import { productService } from "../../product/productService";
import type { Product } from "../../product/types";
import api from "../../../services/api";
import toast from "react-hot-toast";

const STATUS_DISPLAY: Record<string, string> = {
  ACTIVE: "approved",
  INACTIVE: "rejected",
  PENDING_REVIEW: "pending",
  SOLD_OUT: "sold_out",
};

function getDisplayStatus(status: string): string {
  return STATUS_DISPLAY[status] ?? status.toLowerCase();
}

export function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts({}, 1, 100);
      setProducts(response.data);
    } catch (err) {
      setError((err as Error).message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    setIsActing(productId);
    try {
      await api.put(`/products/${productId}/json`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p)),
      );
      toast.success(
        `Product ${newStatus === "ACTIVE" ? "approved" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error((err as Error).message || "Failed to update product");
    } finally {
      setIsActing(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const displayStatus = getDisplayStatus(product.status);
    const matchesStatus =
      statusFilter === "all" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    const display = getDisplayStatus(status);
    switch (display) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Monitoring</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and manage product listings
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 border border-red-200 dark:border-red-900/40 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by product or farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50 dark:bg-green-900/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Farmer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/40";
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {product.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {product.farmerName}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{product.retailPrice}/{product.unit}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Wholesale: ₹{product.wholesalePrice}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {product.quantity} {product.unit}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusStyle(product.status)}`}
                  >
                    {getDisplayStatus(product.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {product.status === "ACTIVE" ? (
                    <button
                      onClick={() => handleStatusChange(product.id, "INACTIVE")}
                      disabled={isActing === product.id}
                      className="text-xs px-3 py-1 rounded font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 disabled:opacity-50"
                    >
                      {isActing === product.id ? "..." : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(product.id, "ACTIVE")}
                      disabled={isActing === product.id}
                      className="text-xs px-3 py-1 rounded font-medium bg-green-600 text-white disabled:opacity-50"
                    >
                      {isActing === product.id ? "..." : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-3 mb-3">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/48";
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">by {product.farmerName}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusStyle(product.status)}`}
              >
                {getDisplayStatus(product.status)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ₹{product.retailPrice}/{product.unit}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Wholesale: ₹{product.wholesalePrice}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {product.quantity} {product.unit} in stock
              </p>
            </div>
            <div className="flex gap-2">
              {product.status === "ACTIVE" ? (
                <button
                  onClick={() => handleStatusChange(product.id, "INACTIVE")}
                  disabled={isActing === product.id}
                  className="flex-1 text-xs py-2 rounded font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 disabled:opacity-50"
                >
                  {isActing === product.id ? "..." : "Deactivate"}
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(product.id, "ACTIVE")}
                  disabled={isActing === product.id}
                  className="flex-1 text-xs py-2 rounded font-medium bg-green-600 text-white disabled:opacity-50"
                >
                  {isActing === product.id ? "..." : "Activate"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No products found</p>
        </div>
      )}
    </div>
  );
}
