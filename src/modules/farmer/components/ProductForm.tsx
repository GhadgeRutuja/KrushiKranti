import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiAddLine,
  RiCloseLine,
  RiLoader4Line,
  RiImageAddLine,
  RiUploadCloud2Line,
  RiPriceTag3Line,
  RiInformationLine,
  RiLeafLine,
  RiCheckboxCircleLine,
  RiLinkM,
} from 'react-icons/ri';
import type { ProductFormData } from '../types';
import type { ProductCategory } from '../../product/types';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.enum(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  retailPrice: z.number().min(1, 'Retail price must be greater than 0'),
  wholesalePrice: z.number().min(1, 'Wholesale price must be greater than 0'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  organic: z.boolean(),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  cancelTo?: string;
}

const categories: { value: ProductCategory; label: string; emoji: string }[] = [
  { value: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'grains', label: 'Grains', emoji: '🌾' },
  { value: 'pulses', label: 'Pulses', emoji: '🫘' },
  { value: 'spices', label: 'Spices', emoji: '🌶️' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

const units = ['kg', 'g', 'piece', 'dozen', 'litre', 'ml', 'bundle'];

/* ─── Reusable Field Wrapper ─────────────────────────────── */
function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
          <RiInformationLine size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Shared input/select className ─────────────────────── */
const inputCls =
  'w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg ' +
  'bg-white dark:bg-slate-900 text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ' +
  'hover:border-slate-300 dark:hover:border-slate-600 transition-colors';

/* ─── Section Card ───────────────────────────────────────── */
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <span className="text-green-600 dark:text-green-400">{icon}</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {/* Card body */}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Component
════════════════════════════════════════════════════════════ */
export function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelTo = '/farmer/products',
}: ProductFormProps) {
  /* ── Image state ── */
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData?.imagePreviews
      ? initialData.imagePreviews
      : (initialData?.imagePreview ? [initialData.imagePreview] : [])
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState(
    initialData?.imageUrls?.length
      ? initialData.imageUrls.join('\n')
      : (initialData?.imageUrl || '')
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── RHF ── */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'vegetables',
      description: initialData?.description || '',
      retailPrice: initialData?.retailPrice || 0,
      wholesalePrice: initialData?.wholesalePrice || 0,
      quantity: initialData?.quantity || 0,
      unit: initialData?.unit || 'kg',
      organic: initialData?.organic || false,
      imageUrl: initialData?.imageUrl || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        category: initialData.category || 'vegetables',
        description: initialData.description || '',
        retailPrice: initialData.retailPrice || 0,
        wholesalePrice: initialData.wholesalePrice || 0,
        quantity: initialData.quantity || 0,
        unit: initialData.unit || 'kg',
        organic: initialData.organic || false,
        imageUrl: initialData.imageUrl || '',
      });
      setImagePreviews(
        initialData.imagePreviews
          ? initialData.imagePreviews
          : (initialData.imagePreview ? [initialData.imagePreview] : [])
      );
      setImageUrlInput(initialData.imageUrls?.length ? initialData.imageUrls.join('\n') : (initialData.imageUrl || ''));
    }
  }, [initialData, reset]);

  /* ── Image helpers ── */
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      setImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  /* Drag-and-drop */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  /* ── Submit ── */
  const onFormSubmit = async (data: ProductFormValues) => {
    const parsedImageUrls = imageUrlInput
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // Validate: at least one image source needed
    const hasUploadedFile = imageFiles.length > 0;
    const hasUrlPasted = parsedImageUrls.length > 0;
    const hasExistingPreview = imagePreviews.length > 0 && imageFiles.length === 0;

    if (!hasUploadedFile && !hasUrlPasted && !hasExistingPreview) {
      // No image at all — allow it, but show a warning could be added
    }

    await onSubmit({
      ...data,
      imagePreview: imagePreviews[0],
      imagePreviews,
      imageUrl: hasUploadedFile ? undefined : (parsedImageUrls[0] || undefined),
      imageUrls: hasUploadedFile ? undefined : (parsedImageUrls.length ? parsedImageUrls : undefined),
      imageFile: imageFiles[0] || undefined,
      imageFiles: imageFiles.length ? imageFiles : undefined,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      {/* ───────────── 1. Product Information Card ─────────────── */}
      <SectionCard icon={<RiLeafLine size={18} />} title="Product Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name — full width */}
          <div className="md:col-span-2">
            <FieldGroup label="Product Name" required error={errors.name?.message}>
              <input
                type="text"
                {...register('name')}
                className={inputCls}
                placeholder="e.g. Fresh Organic Tomatoes"
              />
            </FieldGroup>
          </div>

          {/* Category */}
          <FieldGroup label="Category" required error={errors.category?.message}>
            <select {...register('category')} className={inputCls}>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji}  {cat.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          {/* Unit */}
          <FieldGroup label="Unit" required error={errors.unit?.message}>
            <select {...register('unit')} className={inputCls}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FieldGroup>

          {/* Description — full width */}
          <div className="md:col-span-2">
            <FieldGroup label="Description" required error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Describe your product — freshness, harvest date, growing method, etc."
              />
            </FieldGroup>
          </div>

          {/* Organic toggle — full width */}
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                {...register('organic')}
                className="sr-only peer"
                id="organic-checkbox"
              />
              {/* Custom toggle */}
              <div className="relative w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5 shadow-inner" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex items-center gap-1.5">
                <RiCheckboxCircleLine size={16} className="text-green-500" />
                This is a certified organic product
              </span>
            </label>
          </div>
        </div>
      </SectionCard>

      {/* ───────────── 2. Pricing Card ────────────────────────────── */}
      <SectionCard icon={<RiPriceTag3Line size={18} />} title="Pricing & Inventory">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Retail Price */}
          <FieldGroup label="Retail Price (₹)" required error={errors.retailPrice?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                {...register('retailPrice', { valueAsNumber: true })}
                className={`${inputCls} pl-8`}
                placeholder="0.00"
              />
            </div>
          </FieldGroup>

          {/* Wholesale Price */}
          <FieldGroup label="Wholesale Price (₹)" required error={errors.wholesalePrice?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                {...register('wholesalePrice', { valueAsNumber: true })}
                className={`${inputCls} pl-8`}
                placeholder="0.00"
              />
            </div>
          </FieldGroup>

          {/* Quantity */}
          <FieldGroup label="Available Quantity" required error={errors.quantity?.message}>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className={inputCls}
              placeholder="0"
            />
          </FieldGroup>
        </div>

        {/* Pricing note */}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <RiInformationLine size={14} className="shrink-0" />
          Wholesale price is shown to registered agents &amp; bulk buyers. Retail price is shown to consumers.
        </p>
      </SectionCard>

      {/* ───────────── 3. Images Card ─────────────────────────────── */}
      <SectionCard icon={<RiImageAddLine size={18} />} title="Product Images">
        {/* Option 1: Upload from device */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Option 1 — Upload from device
        </p>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 cursor-pointer
            border-2 border-dashed rounded-xl py-10 px-6 transition-colors
            ${isDragging
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : 'border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }
          `}
        >
          <RiUploadCloud2Line
            size={36}
            className={isDragging ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}
          />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              or{' '}
              <span className="text-green-600 dark:text-green-400 font-semibold underline underline-offset-2">
                browse files
              </span>{' '}
              · PNG, JPG, WEBP up to 10 MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Preview grid */}
        {imagePreviews.length > 0 && (
          <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative group aspect-square">
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors shadow"
                  >
                    <RiCloseLine size={16} />
                  </button>
                </div>
                {/* Primary badge */}
                {idx === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </div>
            ))}

            {/* Add more button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <RiAddLine size={18} />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">OR</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
        </div>

        {/* Option 2: Paste URL */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Option 2 — Paste image URL(s) from internet
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <RiLinkM size={18} />
          </span>
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            className={`${inputCls} pl-10`}
            placeholder="https://example.com/img-1.jpg, https://example.com/img-2.jpg"
          />
        </div>
        {imageUrlInput.trim() && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={imageUrlInput.split(/[\n,]/)[0].trim()}
              alt="URL Preview"
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can paste one or more URLs separated by comma or new line. Uploaded image files take priority.
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <RiInformationLine size={14} className="shrink-0" />
          Uploaded image takes priority over pasted URL. At least one image source is recommended.
        </p>
      </SectionCard>

      {/* ───────────── Action Buttons ─────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-4">
        <Link
          to={cancelTo}
          className="
            px-6 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700
            text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors
          "
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            px-7 py-2.5 text-sm font-semibold rounded-lg
            bg-green-600 hover:bg-green-700 active:bg-green-800
            text-white shadow-sm
            flex items-center gap-2 transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? (
            <>
              <RiLoader4Line size={16} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <RiAddLine size={16} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
