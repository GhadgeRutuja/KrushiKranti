import React, { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import type { UploadType, UploadResponse } from '../../services/UploadService';

interface ImageUploadProps {
  type?: UploadType;
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
  onImageRemove?: () => void;
  initialImageUrl?: string;
  className?: string;
  placeholder?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  type = 'products',
  onUploadSuccess,
  onUploadError,
  onImageRemove,
  initialImageUrl,
  className = '',
  placeholder = 'Click or drag to upload image',
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  maxSizeMB = 10,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(null);

  const {
    upload,
    remove,
    isUploading,
    isDeleting,
    error,
    uploadProgress,
    reset,
  } = useImageUpload({
    onSuccess: (response) => {
      setPreviewUrl(response.url);
      setCurrentPublicId(response.publicId);
      onUploadSuccess?.(response);
    },
    onError: onUploadError,
    maxSizeMB,
  });

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;

    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    await upload(file, type);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentPublicId) {
      await remove(currentPublicId);
    }

    setPreviewUrl(null);
    setCurrentPublicId(null);
    reset();
    onImageRemove?.();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[200px] border-2 border-dashed rounded-lg
          transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        {previewUrl ? (
          <div className="relative w-full h-full min-h-[200px]">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg max-h-[300px]"
            />
            
            {/* Remove button */}
            {!isUploading && !isDeleting && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-white text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Deleting overlay */}
            {isDeleting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-white text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Removing...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center p-6 text-center">
            <svg
              className={`w-12 h-12 mb-3 ${isDragging ? 'text-green-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: {maxSizeMB}MB | JPEG, PNG, GIF, WEBP
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
