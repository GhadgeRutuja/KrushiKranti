import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    FiUser,
    FiMessageSquare,
    FiArrowLeft,
    FiFacebook,
    FiTwitter,
    FiInstagram,
    FiLinkedin,
    FiSearch
} from "react-icons/fi";
import blogBg from "../../assets/Blogspage.png";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBlogById } from "../../modules/blog/blogSlice";
import type { RootState, AppDispatch } from "../../app/store";

export function BlogDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { blogDetails: post, loading, error } = useSelector((state: RootState) => state.blog);

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }
    }, [dispatch, id]);

    if (loading) return <div className="min-h-screen pt-24 text-center">{t("common.loading")}</div>;
    if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;
    if (!post) return <div className="min-h-screen pt-24 text-center">Blog post not found</div>;

    const categories = [
        t("blog.agriculture"),
        t("blog.farm"),
        t("blog.farming"),
        t("blog.fresh_vegetables"),
        t("blog.harvest"),
        t("blog.organic_food"),
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
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-widest mb-6 hover:text-primary-500 transition-colors"
                    >
                        <FiArrowLeft /> {t("blog.back_to_blog")}
                    </Link>
                    <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight tracking-tight drop-shadow-2xl text-white">
                        {post.title}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <article className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="aspect-[21/9] overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="p-8 lg:p-12">
                            <div className="flex items-center gap-6 mb-8 text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FiUser className="text-primary-600" />
                                    <span>{t("blog.by")} {post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMessageSquare className="text-primary-600" />
                                    <span>{post.comments} {post.comments === 1 ? t("blog.comment") : t("blog.comments")}</span>
                                </div>
                            </div>

                            <div
                                className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-p:text-slate-500 dark:prose-p:text-slate-400 prose-p:leading-relaxed
                prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:font-medium"
                            >
                                <p>{post.excerpt}</p>
                                {post.content_body && <div dangerouslySetInnerHTML={{ __html: post.content_body }} />}
                                {post.quote && (
                                    <blockquote>
                                        "{post.quote}"
                                    </blockquote>
                                )}
                            </div>

                            {/* Share & Tags Section */}
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                        {t("blog.share_post")}:
                                    </span>
                                    <div className="flex gap-2">
                                        {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                                            <button key={i} className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-500 hover:bg-primary-600 hover:text-white transition-all">
                                                <Icon size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Comment Section */}
                    <section className="mt-12 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 lg:p-12">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">
                            {t("blog.leave_comment")}
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    placeholder={t("blog.name_placeholder")}
                                    className="bg-slate-50 dark:bg-gray-800 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                                />
                                <input
                                    type="email"
                                    placeholder={t("blog.email_placeholder")}
                                    className="bg-slate-50 dark:bg-gray-800 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                                />
                            </div>
                            <textarea
                                rows={5}
                                placeholder={t("blog.your_message")}
                                className="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                            ></textarea>
                            <button
                                type="button"
                                className="bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest px-10 py-4 rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-95"
                            >
                                {t("blog.post_comment")}
                            </button>
                        </form>
                    </section>
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
                </aside>
            </div>
        </main>
    );
}
