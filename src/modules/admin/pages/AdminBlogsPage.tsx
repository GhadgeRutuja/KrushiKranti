import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Loader2,
  Archive,
  Send,
  Edit2,
  SendHorizonal,
  CalendarDays,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";
import {
  fetchAdminBlogs,
  fetchBlogStats,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  archiveBlog,
} from "../../blog/blogSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80&auto=format&fit=crop";

export function AdminBlogsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { adminBlogs, adminPagination, stats, adminLoading } = useSelector(
    (state: RootState) => state.blog,
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAdminBlogs({ page, size: 9, search: search || undefined }));
    dispatch(fetchBlogStats());
  }, [dispatch, page, search]);

  const refresh = async () => {
    await dispatch(
      fetchAdminBlogs({ page, size: 9, search: search || undefined }),
    );
    await dispatch(fetchBlogStats());
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("adminPages.blogs.confirm_delete"))) return;
    setActing(id);
    try {
      await dispatch(deleteBlog(id)).unwrap();
      toast.success(t("adminPages.blogs.deleted"));
      await refresh();
    } catch (err) {
      toast.error(
        (err as Error).message || t("adminPages.blogs.delete_failed"),
      );
    } finally {
      setActing(null);
    }
  };

  const handlePublish = async (id: number) => {
    setActing(id);
    try {
      await dispatch(publishBlog(id)).unwrap();
      toast.success(t("adminPages.blogs.published"));
      await refresh();
    } catch (err) {
      toast.error(
        (err as Error).message || t("adminPages.blogs.publish_failed"),
      );
    } finally {
      setActing(null);
    }
  };

  const handleUnpublish = async (id: number) => {
    setActing(id);
    try {
      await dispatch(unpublishBlog(id)).unwrap();
      toast.success(t("adminPages.blogs.unpublished"));
      await refresh();
    } catch (err) {
      toast.error(
        (err as Error).message || t("adminPages.blogs.unpublish_failed"),
      );
    } finally {
      setActing(null);
    }
  };

  const handleArchive = async (id: number) => {
    setActing(id);
    try {
      await dispatch(archiveBlog(id)).unwrap();
      toast.success(t("adminPages.blogs.archived"));
      await refresh();
    } catch (err) {
      toast.error(
        (err as Error).message || t("adminPages.blogs.archive_failed"),
      );
    } finally {
      setActing(null);
    }
  };

  const statusBadge: Record<string, string> = {
    PUBLISHED:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    DRAFT:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    ARCHIVED:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  const statsCards = useMemo(
    () => [
      {
        label: t("adminPages.blogs.total_blogs"),
        value: stats.total,
        tone: "text-slate-900 dark:text-white border-slate-200 dark:border-slate-800",
      },
      {
        label: t("adminPages.blogs.published_label"),
        value: stats.published,
        tone: "text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40",
      },
      {
        label: t("adminPages.blogs.drafts"),
        value: stats.draft,
        tone: "text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40",
      },
      {
        label: t("adminPages.blogs.archived"),
        value: stats.archived,
        tone: "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
      },
    ],
    [stats, t],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
                {t("adminPages.blogs.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("adminPages.blogs.subtitle")}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/blogs/create")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              {t("adminPages.blogs.add_blog")}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl border bg-white dark:bg-slate-900 p-4 ${card.tone}`}
              >
                <p className="text-xs uppercase tracking-wide opacity-70">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 max-w-lg relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder={t("adminPages.blogs.search_placeholder")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </section>

        {adminLoading ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-green-600" size={34} />
          </div>
        ) : adminBlogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              {t("adminPages.blogs.empty")}
            </p>
            <button
              onClick={() => navigate("/admin/blogs/create")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              <Plus size={16} />
              {t("adminPages.blogs.create_first")}
            </button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {adminBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={blog.imageUrl || FALLBACK_IMAGE}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full font-medium ${statusBadge[blog.status] ?? statusBadge.ARCHIVED}`}
                      >
                        {blog.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <CalendarDays size={12} />
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 min-h-[3.75rem]">
                      {blog.excerpt || "No short description provided."}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {blog.category || "Uncategorized"} •{" "}
                      {blog.authorName || t("adminPages.blogs.unknown")}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/admin/blogs/edit/${blog.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <Edit2 size={12} /> {t("common.edit")}
                      </button>

                      {blog.status === "DRAFT" && (
                        <button
                          onClick={() => handlePublish(blog.id)}
                          disabled={acting === blog.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs disabled:opacity-50"
                        >
                          <Send size={12} /> {t("adminPages.blogs.publish")}
                        </button>
                      )}

                      {blog.status === "PUBLISHED" && (
                        <button
                          onClick={() => handleUnpublish(blog.id)}
                          disabled={acting === blog.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 text-xs disabled:opacity-50"
                        >
                          <SendHorizonal size={12} />{" "}
                          {t("adminPages.blogs.unpublish")}
                        </button>
                      )}

                      {blog.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleArchive(blog.id)}
                          disabled={acting === blog.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs disabled:opacity-50"
                        >
                          <Archive size={12} /> {t("adminPages.blogs.archive")}
                        </button>
                      )}

                      <a
                        href={`/blog/${blog.slug || blog.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <Eye size={12} /> {t("common.view_all")}
                      </a>

                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={acting === blog.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 text-xs disabled:opacity-50"
                      >
                        <Trash2 size={12} /> {t("common.delete")}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {adminPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  {t("common.previous")}
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t("adminPages.blogs.page_of", {
                    page: page + 1,
                    totalPages: adminPagination.totalPages,
                  })}
                </span>
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(adminPagination.totalPages - 1, p + 1),
                    )
                  }
                  disabled={page >= adminPagination.totalPages - 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
