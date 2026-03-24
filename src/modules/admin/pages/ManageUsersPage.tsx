import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";
import { adminService } from "../adminService";
import type { AdminUser } from "../types";
import toast from "react-hot-toast";

type Role = "farmer" | "wholesaler" | "user" | "admin";
type Status = "active" | "banned" | "pending";

export function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    total: 0,
  });

  const fetchUsers = useCallback(async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllUsers(page, 20);
      setUsers(response.users);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const handleToggleBan = async (userId: string, currentStatus: Status) => {
    setIsActing(userId);
    try {
      if (currentStatus === "banned") {
        const updatedUser = await adminService.unbanUser(userId);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? updatedUser : u)),
        );
        toast.success("User unbanned successfully");
      } else {
        const updatedUser = await adminService.banUser(userId);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? updatedUser : u)),
        );
        toast.success("User banned successfully");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Action failed";
      toast.error(errorMsg);
    } finally {
      setIsActing(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "banned":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleStyle = (role: Role) => {
    switch (role) {
      case "admin":
        return "bg-green-600 text-white dark:bg-green-600 dark:text-white";
      case "farmer":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "wholesaler":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "user":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchUsers(0)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage platform users, roles, and access ({pagination.total} total)
          </p>
        </div>
        <button
          onClick={() => fetchUsers(pagination.page)}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
            className="pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="farmer">Farmers</option>
            <option value="wholesaler">Wholesalers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50 dark:bg-green-900/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Last Login
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 dark:text-green-400 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getRoleStyle(user.role as Role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusStyle(user.status as Status)}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.role !== "admin" && (
                    <button
                      onClick={() =>
                        handleToggleBan(user.id, user.status as Status)
                      }
                      disabled={isActing === user.id}
                      className={`text-xs px-3 py-1 rounded font-medium disabled:opacity-50 ${
                        user.status === "banned"
                          ? "bg-green-600 text-white"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {isActing === user.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : user.status === "banned" ? (
                        "Unban"
                      ) : (
                        "Ban"
                      )}
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
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusStyle(user.status as Status)}`}
              >
                {user.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getRoleStyle(user.role as Role)}`}
              >
                {user.role}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Joined{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            {user.role !== "admin" && (
              <button
                onClick={() => handleToggleBan(user.id, user.status as Status)}
                disabled={isActing === user.id}
                className={`w-full text-xs py-2 rounded font-medium disabled:opacity-50 ${
                  user.status === "banned"
                    ? "bg-green-600 text-white"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {isActing === user.id ? (
                  <Loader2 size={12} className="animate-spin inline" />
                ) : user.status === "banned" ? (
                  "Unban User"
                ) : (
                  "Ban User"
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchUsers(pagination.page - 1)}
            disabled={pagination.page === 0 || isLoading}
            className="px-3 py-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchUsers(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1 || isLoading}
            className="px-3 py-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
