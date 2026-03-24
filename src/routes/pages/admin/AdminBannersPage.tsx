import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { bannerService } from "../../../services/bannerService";
import type { Banner } from "../../../services/bannerService";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface BannerFormValues {
  title: string;
  subtitle: string;
  buttonText: string;
  redirectUrl: string;
  isActive: boolean;
}

export function AdminBannersPage() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<BannerFormValues>();

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAllBanners();
      setBanners(response);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      toast.error(t("adminPages.banners.failed_load"));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    try {
      if (editingId) {
        // Update existing banner
        await bannerService.updateBanner(editingId, data);
        toast.success(t("adminPages.banners.updated"));
      } else {
        if (!selectedImage) {
          toast.error(t("adminPages.banners.select_image"));
          return;
        }

        await bannerService.createBanner({
          title: data.title,
          subtitle: data.subtitle,
          buttonText: data.buttonText,
          redirectUrl: data.redirectUrl,
          isActive: data.isActive ?? true,
          imageFile: selectedImage,
        });
        toast.success(t("adminPages.banners.created"));
      }
      reset();
      setShowForm(false);
      setEditingId(null);
      setSelectedImage(null);
      fetchBanners();
    } catch (error) {
      console.error("Failed to save banner:", error);
      toast.error(t("adminPages.banners.failed_save"));
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setValue("title", banner.title);
    setValue("subtitle", banner.subtitle);
    setValue("buttonText", banner.buttonText);
    setValue("redirectUrl", banner.redirectUrl);
    setValue("isActive", banner.isActive);
    setSelectedImage(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t("adminPages.banners.confirm_delete"))) {
      try {
        await bannerService.deleteBanner(id);
        toast.success(t("adminPages.banners.deleted"));
        fetchBanners();
      } catch (error) {
        console.error("Failed to delete banner:", error);
        toast.error(t("adminPages.banners.failed_delete"));
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await bannerService.toggleBanner(id);
      toast.success(t("adminPages.banners.status_updated"));
      fetchBanners();
    } catch (error) {
      console.error("Failed to toggle banner status:", error);
      toast.error(t("adminPages.banners.failed_status_update"));
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingId(null);
    setSelectedImage(null);
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("adminPages.banners.image_only"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("adminPages.banners.max_size"));
      return;
    }

    setSelectedImage(file);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container-custom py-12">
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            {t("adminPages.banners.title")}
          </h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <FaPlus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t("adminPages.banners.add_new")}
              </span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId
                  ? t("adminPages.banners.edit")
                  : t("adminPages.banners.add_new")}
              </h2>
              <button
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t("adminPages.banners.form.title")} *
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  placeholder={t("adminPages.banners.form.title_placeholder")}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t("adminPages.banners.form.subtitle")} *
                </label>
                <input
                  type="text"
                  {...register("subtitle", {
                    required: "Subtitle is required",
                  })}
                  placeholder={t(
                    "adminPages.banners.form.subtitle_placeholder",
                  )}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                {errors.subtitle && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.subtitle.message}
                  </p>
                )}
              </div>

              {/* Banner Image Upload */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t("adminPages.banners.form.image")} *
                  </label>
                  <div
                    className={`w-full rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      dragActive
                        ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                    }}
                    onDrop={onDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileSelect(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="banner-image-upload"
                    />
                    <label
                      htmlFor="banner-image-upload"
                      className="cursor-pointer text-slate-600 dark:text-slate-300"
                    >
                      {t("adminPages.banners.form.image_help")}
                    </label>
                    {selectedImage && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        {t("adminPages.banners.form.selected")}:{" "}
                        {selectedImage.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Redirect URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t("adminPages.banners.form.redirect_url")} *
                </label>
                <input
                  type="text"
                  {...register("redirectUrl", {
                    required: "Redirect URL is required",
                  })}
                  placeholder={t(
                    "adminPages.banners.form.redirect_placeholder",
                  )}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                {errors.redirectUrl && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.redirectUrl.message}
                  </p>
                )}
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t("adminPages.banners.form.button_text")} *
                </label>
                <input
                  type="text"
                  {...register("buttonText", {
                    required: "Button text is required",
                  })}
                  placeholder={t("adminPages.banners.form.button_placeholder")}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                {errors.buttonText && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.buttonText.message}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    defaultChecked={true}
                    className="w-5 h-5 border-slate-300 rounded focus:ring-2 focus:ring-green-600"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t("adminPages.banners.form.active")}
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {editingId
                    ? t("adminPages.banners.update")
                    : t("adminPages.banners.create")}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {t("adminPages.banners.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Banner Image Preview */}
                <div className="relative h-40 bg-slate-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {t("adminPages.banners.inactive")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {banner.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {banner.subtitle}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(banner.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
                    >
                      {banner.isActive
                        ? t("adminPages.banners.disable")
                        : t("adminPages.banners.enable")}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
                    >
                      <FaEdit size={14} />
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
                    >
                      <FaTrash size={14} />
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
