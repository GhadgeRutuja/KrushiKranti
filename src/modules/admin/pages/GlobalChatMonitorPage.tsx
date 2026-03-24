import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { fetchConversations } from "../../bulk/negotiationSlice";
import { useNavigate } from "react-router-dom";
import { RiMessage2Line } from "react-icons/ri";

const formatTime = (ts: string) =>
  ts ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-700",
  AGREED: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
};

const GlobalChatMonitorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversations, isLoading } = useAppSelector(
    (state) => state.negotiation,
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <RiMessage2Line className="text-primary-600" />
          Global Chat Monitor
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-800">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No active negotiations found across the platform.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {["Product", "Farmer", "Wholesaler", "Status", "Started", "Action"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 5 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {conversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {conv.bulkProductName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{conv.farmerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{conv.wholesalerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[conv.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {conv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatTime(conv.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/chat/${conv.id}`)}
                        className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                      >
                        View Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalChatMonitorPage;
