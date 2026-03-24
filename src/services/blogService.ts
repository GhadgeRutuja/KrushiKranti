import api from './api';

export interface BlogResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  category: string | null;
  tags: string | null;
  authorName: string;
  authorId: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  category?: string;
  tags?: string;
  authorName?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BlogPage {
  content: BlogResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

// ─── Public ────────────────────────────────────────────────────────────────

export const fetchPublishedBlogs = async (params?: {
  search?: string;
  page?: number;
  size?: number;
}): Promise<BlogPage> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  query.append('page', String(params?.page ?? 0));
  query.append('size', String(params?.size ?? 10));
  const res = await api.get<ApiEnvelope<BlogPage>>(`/blogs?${query}`);
  return res.data.data;
};

export const fetchBlogBySlug = async (slug: string): Promise<BlogResponse> => {
  const res = await api.get<ApiEnvelope<BlogResponse>>(`/blogs/${slug}`);
  return res.data.data;
};

// ─── Admin ─────────────────────────────────────────────────────────────────

export const fetchAllBlogsAdmin = async (params?: {
  search?: string;
  page?: number;
  size?: number;
}): Promise<BlogPage> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  query.append('page', String(params?.page ?? 0));
  query.append('size', String(params?.size ?? 10));
  const res = await api.get<ApiEnvelope<BlogPage>>(`/blogs/admin/all?${query}`);
  return res.data.data;
};

export const fetchBlogStats = async (): Promise<BlogStats> => {
  const res = await api.get<ApiEnvelope<BlogStats>>('/blogs/admin/stats');
  return res.data.data;
};

export const fetchBlogById = async (id: number): Promise<BlogResponse> => {
  const res = await api.get<ApiEnvelope<BlogResponse>>(`/blogs/admin/${id}`);
  return res.data.data;
};

export const createBlog = async (req: BlogRequest, authorId: number): Promise<BlogResponse> => {
  const res = await api.post<ApiEnvelope<BlogResponse>>(`/blogs?authorId=${authorId}`, req);
  return res.data.data;
};

export const updateBlog = async (id: number, req: BlogRequest): Promise<BlogResponse> => {
  const res = await api.put<ApiEnvelope<BlogResponse>>(`/blogs/${id}`, req);
  return res.data.data;
};

export const deleteBlogById = async (id: number): Promise<void> => {
  await api.delete(`/blogs/${id}`);
};

export const publishBlog = async (id: number): Promise<BlogResponse> => {
  const res = await api.patch<ApiEnvelope<BlogResponse>>(`/blogs/${id}/publish`);
  return res.data.data;
};

export const unpublishBlog = async (id: number): Promise<BlogResponse> => {
  const res = await api.patch<ApiEnvelope<BlogResponse>>(`/blogs/${id}/unpublish`);
  return res.data.data;
};

export const archiveBlog = async (id: number): Promise<BlogResponse> => {
  const res = await api.patch<ApiEnvelope<BlogResponse>>(`/blogs/${id}/archive`);
  return res.data.data;
};
