import { useCallback, useState } from "react";
import { useAppDispatch } from "../../../shared/hooks";
import { createEventThunk } from "../eventsSlice";
import {
  RiCloseLine,
  RiLoader4Line,
  RiImageAddLine,
  RiLink,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";

interface AddEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEventModal({ onClose, onSuccess }: AddEventModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isValidDateInput = (date: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(date).getTime());

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    state: "",
    district: "",
    zone: "",
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDropImage = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      });

      setFormData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
      }));
      setImageError(false);
      toast.success("Image selected successfully");
    } catch {
      toast.error("Unable to process selected image");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDropImage,
    accept: { "image/*": [] },
    multiple: false,
    disabled: loading,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (formData.title.length < 3)
      newErrors.title = "Title must be at least 3 characters";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.description.length < 10)
      newErrors.description = "Description must be at least 10 characters";

    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && !isValidDateInput(formData.startDate)) {
      newErrors.startDate = "Start date must be in yyyy-MM-dd format";
    }
    if (formData.endDate && !isValidDateInput(formData.endDate)) {
      newErrors.endDate = "End date must be in yyyy-MM-dd format";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "imageUrl") {
      setImageError(false);
    }
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
      };


      const result = await dispatch(createEventThunk(payload));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Event created successfully");
        onSuccess();
      } else {
        toast.error(result.payload as string);
      }
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-800">
        <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-gray-100">
            Add New Event
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white dark:bg-gray-900">
          <div>
            <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field rounded-xl"
              placeholder="e.g., Organic Farming Workshop"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field rounded-xl resize-none"
              placeholder="Detailed description of the event..."
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
              Event Image
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="relative">
                  <RiLink
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="input-field rounded-xl pl-9"
                    placeholder="Paste image URL"
                  />
                </div>

                <div
                  {...getRootProps()}
                  className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-300 dark:border-gray-700 hover:border-primary-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <RiImageAddLine
                    size={24}
                    className="mx-auto mb-2 text-primary-600 dark:text-primary-400"
                  />
                  <p className="text-sm text-slate-600 dark:text-gray-300 font-medium">
                    {isDragActive
                      ? "Drop the image here"
                      : "Drag and drop image here"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                    or click to upload from your device
                  </p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 h-44">
                <img
                  src={
                    !imageError && formData.imageUrl
                      ? formData.imageUrl
                      : FALLBACK_EVENT_IMAGE
                  }
                  alt="Event preview"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field rounded-xl"
              placeholder="e.g., Agricultural Training Center, Pune"
            />
            {errors.location && (
              <p className="text-red-400 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-field rounded-xl"
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="input-field rounded-xl"
                placeholder="District"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
                Zone
              </label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="input-field rounded-xl"
                placeholder="Zone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field rounded-xl"
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-200 font-medium mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field rounded-xl"
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600 disabled:opacity-50 text-white rounded-xl transition-all duration-300"
            >
              {loading && <RiLoader4Line className="animate-spin" />}
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
