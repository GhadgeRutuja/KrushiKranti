import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiDeleteBinLine, RiMailCheckLine, RiRefreshLine } from 'react-icons/ri';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import {
  deleteAdminContactMessageThunk,
  fetchAdminContactMessages,
  fetchAdminUnreadContactCount,
  markAdminContactMessageReadThunk,
} from '../contactMessagesSlice';

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateMessage(message: string, maxLength: number = 90): string {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength)}...`;
}

export function AdminContactMessagesPage() {
  const dispatch = useAppDispatch();
  const { messages, unreadCount, isLoading, error } = useAppSelector((state) => state.adminContactMessages);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAdminContactMessages());
    dispatch(fetchAdminUnreadContactCount());
  }, [dispatch]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [messages],
  );

  const refreshMessages = async () => {
    await dispatch(fetchAdminContactMessages());
    await dispatch(fetchAdminUnreadContactCount());
  };

  const handleMarkRead = async (id: number) => {
    try {
      setActionLoadingId(id);
      await dispatch(markAdminContactMessageReadThunk(id)).unwrap();
      toast.success('Message marked as read');
    } catch (err) {
      toast.error((err as string) || 'Failed to mark as read');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      await dispatch(deleteAdminContactMessageThunk(id)).unwrap();
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error((err as string) || 'Failed to delete message');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Contact Messages</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage website contact form submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
            Unread: {unreadCount}
          </span>
          <button
            type="button"
            onClick={refreshMessages}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 text-gray-100 px-3 py-2 text-xs font-semibold hover:bg-gray-700 transition-all duration-300"
          >
            <RiRefreshLine size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-sm text-slate-500 dark:text-slate-400">Loading contact messages...</div>
        ) : error ? (
          <div className="p-8 text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : sortedMessages.length === 0 ? (
          <div className="p-8 text-sm text-slate-500 dark:text-slate-400">No contact messages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-slate-700">
                  {['Name', 'Email', 'Subject', 'Message', 'Date', 'Status', 'Actions'].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedMessages.map((message) => {
                  const isUnread = message.status === 'UNREAD';
                  const rowActionLoading = actionLoadingId === message.id;

                  return (
                    <tr key={message.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-all duration-300">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-gray-100">{message.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{message.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-gray-100 font-medium">{message.subject}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-[320px]" title={message.message}>
                        {truncateMessage(message.message)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(message.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${isUnread
                            ? 'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                            : 'border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300'
                            }`}
                        >
                          {isUnread ? 'Unread' : 'Read'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!isUnread || rowActionLoading}
                            onClick={() => handleMarkRead(message.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-green-500 text-white px-2.5 py-1.5 text-xs font-semibold hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RiMailCheckLine size={14} /> Read
                          </button>
                          <button
                            type="button"
                            disabled={rowActionLoading}
                            onClick={() => handleDelete(message.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-500 text-white px-2.5 py-1.5 text-xs font-semibold hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RiDeleteBinLine size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
