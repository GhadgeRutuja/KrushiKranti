import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as blogService from '../../services/blogService';
import type { BlogResponse, BlogRequest } from '../../services/blogService';
import { getThunkErrorMessage } from '../../utils/errorHandler';

/** Normalised shape consumed by public BlogPage & BlogDetailPage */
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    /** HTML content used in detail view */
    content_body?: string;
    quote?: string;
    image: string;
    date: string;
    author: string;
    comments: number;
    category?: string;
    tags?: string;
    status?: string;
}

interface BlogState {
    blogs: BlogPost[];
    featuredBlogs: BlogPost[];
    blogDetails: BlogPost | null;
    adminBlogs: BlogResponse[];
    adminPagination: {
        page: number;
        size: number;
        totalPages: number;
        totalElements: number;
    };
    stats: {
        total: number;
        published: number;
        draft: number;
        archived: number;
    };
    loading: boolean;
    adminLoading: boolean;
    error: string | null;
    adminError: string | null;
}

const initialState: BlogState = {
    blogs: [],
    featuredBlogs: [],
    blogDetails: null,
    adminBlogs: [],
    adminPagination: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    stats: { total: 0, published: 0, draft: 0, archived: 0 },
    loading: false,
    adminLoading: false,
    error: null,
    adminError: null,
};

function toPost(b: BlogResponse): BlogPost {
    return {
        id: String(b.id),
        title: b.title,
        slug: b.slug ?? String(b.id),
        excerpt: b.excerpt ?? '',
        content_body: b.content,
        image: b.imageUrl ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
        date: b.createdAt
            ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
            : '',
        author: b.authorName ?? 'KrushiKranti',
        comments: 0,
        category: b.category ?? undefined,
        tags: b.tags ?? undefined,
        status: b.status,
    };
}

export const fetchBlogs = createAsyncThunk('blog/fetchBlogs', async () => {
    const page = await blogService.fetchPublishedBlogs({ page: 0, size: 20 });
    return page.content.map(toPost);
});

export const fetchBlogById = createAsyncThunk('blog/fetchBlogById', async (id: string) => {
    const blog = await blogService.fetchBlogBySlug(id);
    return toPost(blog);
});

export const fetchAdminBlogs = createAsyncThunk(
    'blog/fetchAdminBlogs',
    async (params: { search?: string; page?: number; size?: number } | undefined) => {
        return blogService.fetchAllBlogsAdmin(params);
    }
);

export const fetchBlogStats = createAsyncThunk('blog/fetchBlogStats', async () => {
    return blogService.fetchBlogStats();
});

export const createBlog = createAsyncThunk(
    'blog/createBlog',
    async (payload: { req: BlogRequest; authorId: number }) => {
        return blogService.createBlog(payload.req, payload.authorId);
    }
);

export const updateBlog = createAsyncThunk(
    'blog/updateBlog',
    async (payload: { id: number; req: BlogRequest }) => {
        return blogService.updateBlog(payload.id, payload.req);
    }
);

export const deleteBlog = createAsyncThunk('blog/deleteBlog', async (id: number) => {
    await blogService.deleteBlogById(id);
    return id;
});

export const publishBlog = createAsyncThunk('blog/publishBlog', async (id: number) => {
    return blogService.publishBlog(id);
});

export const unpublishBlog = createAsyncThunk('blog/unpublishBlog', async (id: number) => {
    return blogService.unpublishBlog(id);
});

export const archiveBlog = createAsyncThunk('blog/archiveBlog', async (id: number) => {
    return blogService.archiveBlog(id);
});

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = action.payload;
                state.featuredBlogs = action.payload.slice(0, 3);
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = getThunkErrorMessage(action, 'Unable to load blogs');
            })
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.blogDetails = null;
                state.error = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.blogDetails = action.payload;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = getThunkErrorMessage(action, 'Unable to load blog details');
            })
            .addCase(fetchAdminBlogs.pending, (state) => {
                state.adminLoading = true;
                state.adminError = null;
            })
            .addCase(fetchAdminBlogs.fulfilled, (state, action) => {
                state.adminLoading = false;
                state.adminBlogs = action.payload.content;
                state.adminPagination = {
                    page: action.payload.number,
                    size: action.payload.size,
                    totalPages: action.payload.totalPages,
                    totalElements: action.payload.totalElements,
                };
            })
            .addCase(fetchAdminBlogs.rejected, (state, action) => {
                state.adminLoading = false;
                state.adminError = getThunkErrorMessage(action, 'Unable to load admin blogs');
            })
            .addCase(fetchBlogStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.adminBlogs = [action.payload, ...state.adminBlogs];
                state.stats.total += 1;
                if (action.payload.status === 'PUBLISHED') state.stats.published += 1;
                if (action.payload.status === 'DRAFT') state.stats.draft += 1;
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.adminBlogs = state.adminBlogs.map((b) => (b.id === action.payload.id ? action.payload : b));
            })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                const removed = state.adminBlogs.find((b) => b.id === action.payload);
                state.adminBlogs = state.adminBlogs.filter((b) => b.id !== action.payload);
                if (removed) {
                    state.stats.total = Math.max(0, state.stats.total - 1);
                    if (removed.status === 'PUBLISHED') state.stats.published = Math.max(0, state.stats.published - 1);
                    if (removed.status === 'DRAFT') state.stats.draft = Math.max(0, state.stats.draft - 1);
                }
            })
            .addCase(publishBlog.fulfilled, (state, action) => {
                state.adminBlogs = state.adminBlogs.map((b) => (b.id === action.payload.id ? action.payload : b));
            })
            .addCase(unpublishBlog.fulfilled, (state, action) => {
                state.adminBlogs = state.adminBlogs.map((b) => (b.id === action.payload.id ? action.payload : b));
            })
            .addCase(archiveBlog.fulfilled, (state, action) => {
                state.adminBlogs = state.adminBlogs.map((b) => (b.id === action.payload.id ? action.payload : b));
            });
    },
});

export default blogSlice.reducer;
