import { useState, useCallback } from 'react';
import {
  uploadImage,
  uploadProductImage,
  uploadAvatar,
  uploadBlogImage,
  deleteImage,
} from '../../services/UploadService';
import type { UploadResponse, UploadType } from '../../services/UploadService';

interface UseImageUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface UseImageUploadReturn {
  upload: (file: File, type?: UploadType) => Promise<UploadResponse | null>;
  uploadProduct: (file: File) => Promise<UploadResponse | null>;
  uploadUserAvatar: (file: File) => Promise<UploadResponse | null>;
  uploadBlog: (file: File) => Promise<UploadResponse | null>;
  remove: (publicId: string) => Promise<boolean>;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  uploadedUrl: string | null;
  uploadProgress: number;
  reset: () => void;
}

const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const {
    onSuccess,
    onError,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file) {
        return 'No file selected';
      }

      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size exceeds ${maxSizeMB}MB limit`;
      }

      return null;
    },
    [allowedTypes, maxSizeMB]
  );

  const handleUpload = useCallback(
    async (
      uploadFn: () => Promise<UploadResponse>,
      file: File
    ): Promise<UploadResponse | null> => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onError?.(new Error(validationError));
        return null;
      }

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Simulate progress (actual progress tracking requires custom axios config)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await uploadFn();

        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadedUrl(response.url);
        onSuccess?.(response);

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onSuccess, onError]
  );

  const upload = useCallback(
    (file: File, type: UploadType = 'products') => {
      return handleUpload(() => uploadImage(file, type), file);
    },
    [handleUpload]
  );

  const uploadProduct = useCallback(
    (file: File) => {
      return handleUpload(() => uploadProductImage(file), file);
    },
    [handleUpload]
  );

  const uploadUserAvatar = useCallback(
    (file: File) => {
      return handleUpload(() => uploadAvatar(file), file);
    },
    [handleUpload]
  );

  const uploadBlog = useCallback(
    (file: File) => {
      return handleUpload(() => uploadBlogImage(file), file);
    },
    [handleUpload]
  );

  const remove = useCallback(
    async (publicId: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        await deleteImage(publicId);
        setUploadedUrl(null);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Delete failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setUploadedUrl(null);
    setUploadProgress(0);
  }, []);

  return {
    upload,
    uploadProduct,
    uploadUserAvatar,
    uploadBlog,
    remove,
    isUploading,
    isDeleting,
    error,
    uploadedUrl,
    uploadProgress,
    reset,
  };
};

export default useImageUpload;
