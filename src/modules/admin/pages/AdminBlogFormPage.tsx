import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import type { AppDispatch } from "../../../app/store";
import { uploadBlogImage } from "../../../services/UploadService";
import * as blogService from "../../../services/blogService";
import type { BlogRequest } from "../../../services/blogService";
import { createBlog, updateBlog } from "../../blog/blogSlice";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  LinkIcon,
  Loader2,
  Upload,
} from "lucide-react";

const CATEGORIES = [
  "Agriculture",
  "Farming Tips",
  "Organic Food",
  "Technology",
  "Market News",
  "Sustainability",
  "Weather",
  "Policy",
];

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  tags: "",
  authorName: "",
  status: "DRAFT",
  metaTitle: "",
  metaDescription: "",
  imageUrl: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminBlogFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);

  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    authorName: user?.name ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your blog content here…" }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert min-h-[280px] max-w-none p-4 focus:outline-none",
      },
    },
  });

  // Load blog data when editing
  useEffect(() => {
    if (!isEditing || !id) return;
    setLoadingBlog(true);
    blogService
      .fetchBlogById(Number(id))
      .then((blog) => {
        setForm({
          title: blog.title,
          slug: blog.slug ?? "",
          excerpt: blog.excerpt ?? "",
          category: blog.category ?? "",
          tags: blog.tags ?? "",
          authorName: blog.authorName ?? "",
          status: (blog.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") as
            | "DRAFT"
            | "PUBLISHED",
          metaTitle: blog.metaTitle ?? "",
          metaDescription: blog.metaDescription ?? "",
          imageUrl: blog.imageUrl ?? "",
        });
        editor?.commands.setContent(blog.content);
        setSlugEdited(true); // treat loaded slug as already edited
      })
      .catch(() => toast.error("Unable to load blog details"))
      .finally(() => setLoadingBlog(false));
  }, [id, isEditing, editor]);

  const handleFieldChange = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        // Auto-generate slug from title unless user manually edited it
        if (key === "title" && !slugEdited) {
          updated.slug = slugify(value as string);
        }
        return updated;
      });
    },
    [slugEdited],
  );

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const res = await uploadBlogImage(file);
      handleFieldChange("imageUrl", res.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Unable to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const insertEditorImage = async (file: File) => {
    setImageUploading(true);
    try {
      const res = await uploadBlogImage(file);
      editor?.chain().focus().setImage({ src: res.url }).run();
    } catch {
      toast.error("Unable to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const onDropFeaturedImage = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      await handleImageUpload(file);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropFeaturedImage,
    accept: { "image/*": [] },
    multiple: false,
    disabled: imageUploading,
  });

  const handleSave = async (publishNow?: boolean) => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editor?.getText().trim()) {
      toast.error("Content is required");
      return;
    }
    if (!user?.id) {
      toast.error("Cannot determine logged-in user");
      return;
    }

    setSaving(true);
    const content = editor.getHTML();

    const req: BlogRequest = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || undefined,
      content,
      imageUrl: form.imageUrl || undefined,
      category: form.category || undefined,
      tags: form.tags || undefined,
      authorName: form.authorName || undefined,
      status: publishNow ? "PUBLISHED" : form.status,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
    };

    try {
      if (isEditing && id) {
        await dispatch(updateBlog({ id: Number(id), req })).unwrap();
        toast.success("Blog updated");
      } else {
        await dispatch(createBlog({ req, authorId: Number(user.id) })).unwrap();
        toast.success("Blog created");
      }
      navigate("/admin/blogs");
    } catch (err) {
      toast.error((err as Error).message || "Unable to save blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingBlog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/blogs")}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Blog" : "Create Blog"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditing
              ? "Update an existing blog post"
              : "Write and publish a new blog post"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Enter blog title…"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  handleFieldChange("slug", slugify(e.target.value));
                }}
                placeholder="auto-generated-from-title"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Short Description / Excerpt
            </label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => handleFieldChange("excerpt", e.target.value)}
              placeholder="Brief description shown in blog listings…"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex flex-wrap items-center gap-1">
              <span className="text-xs font-semibold text-gray-500 mr-2 px-1">
                Content *
              </span>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive("bold")}
                title="Bold"
              >
                <Bold size={14} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive("italic")}
                title="Italic"
              >
                <Italic size={14} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor?.isActive("heading", { level: 2 })}
                title="Heading 2"
              >
                <Heading2 size={14} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                active={editor?.isActive("bulletList")}
                title="Bullet list"
              >
                <List size={14} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                active={editor?.isActive("orderedList")}
                title="Ordered list"
              >
                <ListOrdered size={14} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                active={editor?.isActive("blockquote")}
                title="Blockquote"
              >
                <Quote size={14} />
              </ToolbarButton>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Enter URL:");
                  if (url) editor?.chain().focus().setLink({ href: url }).run();
                }}
                active={editor?.isActive("link")}
                title="Insert link"
              >
                <LinkIcon size={14} />
              </ToolbarButton>
              <label className="cursor-pointer" title="Insert image">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) insertEditorImage(file);
                    e.target.value = "";
                  }}
                />
                <ToolbarButton active={false} title="Insert image">
                  <ImageIcon size={14} />
                </ToolbarButton>
              </label>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().undo().run()}
                title="Undo"
              >
                <Undo size={14} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().redo().run()}
                title="Redo"
              >
                <Redo size={14} />
              </ToolbarButton>
            </div>
            <div className="min-h-70 text-gray-900 dark:text-white text-sm">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              SEO Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) =>
                    handleFieldChange("metaTitle", e.target.value)
                  }
                  placeholder="SEO title (defaults to blog title)"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) =>
                    handleFieldChange("metaDescription", e.target.value)
                  }
                  placeholder="Brief description for search engines (150-160 chars recommended)"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Publish
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleFieldChange(
                    "status",
                    e.target.value as "DRAFT" | "PUBLISHED",
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {isEditing ? "Update & Publish" : "Publish Now"}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Featured Image
            </h3>
            {form.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden aspect-video mb-3">
                <img
                  src={form.imageUrl}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleFieldChange("imageUrl", "")}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`aspect-video rounded-lg border-2 border-dashed flex items-center justify-center mb-3 px-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-green-400"
                }`}
              >
                <input {...getInputProps()} />
                {imageUploading ? (
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {isDragActive
                        ? "Drop image here"
                        : "Drag & drop image here"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>
            )}
            <label className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <Upload size={13} />
              {imageUploading ? "Uploading…" : "Upload Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={imageUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                placeholder="Or paste image URL"
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Category & Tags
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    handleFieldChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tags{" "}
                  <span className="text-gray-400 font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => handleFieldChange("tags", e.target.value)}
                  placeholder="e.g. organic,farming,tips"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Author Name
            </label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => handleFieldChange("authorName", e.target.value)}
              placeholder="Author display name"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick?: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
