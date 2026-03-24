import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiSearch, FiUser, FiMessageSquare, FiArrowRight } from "react-icons/fi";
import { RiArticleLine } from "react-icons/ri";
import blogBg from "../../assets/Blogspage.png";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBlogs } from "../../modules/blog/blogSlice";
import type { RootState, AppDispatch } from "../../app/store";
import { EmptyState, ErrorState, Skeleton } from "../../shared/components/ui";

export function BlogPage() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { blogs: blogPosts, loading, error } = useSelector((state: RootState) => state.blog);

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    const latestPosts = blogPosts.slice(0, 3);
    const categories = [
        t("blog.agriculture"),
        t("blog.farm"),
        t("blog.farming"),
        t("blog.fresh_vegetables"),
        t("blog.harvest"),
        t("blog.organic_food"),
    ];
    const tags = [
        t("blog.agriculture"),
        t("blog.farming"),
        t("blog.harvest"),
        t("blog.organic_food"),
        t("blog.vegetables"),
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
            {/* Banner Area */}
            <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800">
                <div className="absolute inset-0 z-0">
                    <img src={blogBg} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                </div>
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 lg:py-24 relative z-10 text-left">
                    <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-4">
                        {t('common.home')} / {t('common.blog')}
                    </p>
                    <h1 className="text-4xl lg:text-7xl font-black mb-4 leading-tight tracking-tight drop-shadow-2xl text-white">
                        {t("blog.hero_title")} <span className="text-primary-500">{t("blog.hero_highlight")}</span>
                    </h1>
                    <p className="text-white/90 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed drop-shadow-md">
                        {t("blog.hero_tagline")}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Blog Post List */}
                <div className="lg:col-span-2 space-y-16">
                    {loading && (
                        <div className="space-y-12">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="space-y-5">
                                    <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-10 w-5/6" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <ErrorState
                            message={error}
                            onRetry={() => dispatch(fetchBlogs())}
                        />
                    )}

                    {!loading && !error && blogPosts.length === 0 && (
                        <EmptyState
                            icon={<RiArticleLine size={28} />}
                            title="No blog posts yet"
                            message="Fresh stories and farming insights will appear here soon."
                            actionLabel="Refresh"
                            onAction={() => dispatch(fetchBlogs())}
                        />
                    )}

                    {!loading && !error && blogPosts.map((post) => (
                        <article key={post.id} className="group">
                            <div className="relative overflow-hidden rounded-2xl aspect-[16/9] mb-8 shadow-xl">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-6 left-6 bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
                                    {post.date}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-4 text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FiUser className="text-primary-600" />
                                    <span>{t("blog.by")} {post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMessageSquare className="text-primary-600" />
                                    <span>{post.comments} {post.comments === 1 ? t("blog.comment") : t("blog.comments")}</span>
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                                {post.title}
                            </h2>

                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed line-clamp-3">
                                {post.excerpt}
                            </p>

                            <Link
                                to={`/blog/${post.slug || post.id}`}
                                className="inline-flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group/btn"
                            >
                                <span>{t("blog.read_more")}</span>
                                <FiArrowRight className="text-primary-600 transition-transform duration-300 group-hover/btn:translate-x-2" />
                            </Link>
                        </article>
                    ))}

                    {/* Pagination Placeholder */}
                    <div className="flex items-center justify-center gap-3 pt-8 pb-12">
                        <button className="w-10 h-10 rounded-lg bg-primary-600 text-white font-bold flex items-center justify-center shadow-lg shadow-primary-600/20 active:scale-95">1</button>
                        <button className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white font-bold flex items-center justify-center hover:border-primary-600 dark:hover:border-primary-600 transition-all active:scale-95">2</button>
                        <button className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white font-bold flex items-center justify-center hover:border-primary-600 dark:hover:border-primary-600 transition-all active:scale-95">&gt;</button>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    {/* Search */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t("blog.search_placeholder")}
                                className="w-full bg-[#fde176] placeholder:text-slate-600 text-slate-900 font-bold px-6 py-4 rounded-xl focus:outline-none transition-all"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#fde176] flex items-center justify-center text-white">
                                <FiSearch size={22} className="stroke-[3px]" />
                            </button>
                        </div>
                    </div>

                    {/* Latest Posts */}
                    <div className="bg-[#f7f6f2] dark:bg-gray-900/50 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 relative inline-block">
                            {t("blog.latest_posts")}
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary-600" />
                        </h3>
                        <div className="space-y-6">
                            {latestPosts.map((post) => (
                                <div key={post.id} className="flex gap-4 group cursor-pointer">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                        <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-accent-600 uppercase tracking-widest mb-1">
                                            <FiUser className="text-primary-500" />
                                            <span>{t("blog.by")} {post.author}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-[#f7f6f2] dark:bg-gray-900/50 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 relative inline-block">
                            {t("blog.categories")}
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary-600" />
                        </h3>
                        <ul className="space-y-4">
                            {categories.map((cat, idx) => (
                                <li key={idx}>
                                    <a href="#" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">
                                        {cat}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tags */}
                    <div className="bg-[#f7f6f2] dark:bg-gray-900/50 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 relative inline-block">
                            {t("blog.tags")}
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary-600" />
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="bg-white dark:bg-gray-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all"
                                >
                                    {tag}
                                </a>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
