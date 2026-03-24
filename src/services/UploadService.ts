import api from './api';

export type UploadType = 'products' | 'avatars' | 'blogs';

export interface UploadResponse {
  url: string;
  publicId: string;
  folder: string;
  originalFilename: string;
}

export interface ApiUploadResponse {
  success: boolean;
  message: string;
  data: UploadResponse;
  timestamp: string;
}

/**
 * Upload an image to Cloudinary via the backend
 * @param file - The file to upload
 * @param type - The type of image: 'products', 'avatars', or 'blogs'
 * @returns Promise with the upload response
 */
export const uploadImage = async (
  file: File,
  type: UploadType = 'products'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post<ApiUploadResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Upload a product image
 * @param file - The product image file
 * @returns Promise with the upload response
 */
export const uploadProductImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiUploadResponse>('/upload/product-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Upload a user avatar
 * @param file - The avatar image file
 * @returns Promise with the upload response
 */
export const uploadAvatar = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiUploadResponse>('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Upload a blog image
 * @param file - The blog image file
 * @returns Promise with the upload response
 */
export const uploadBlogImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiUploadResponse>('/upload/blog-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise with success status
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  await api.delete('/upload/image', {
    params: { publicId },
  });
};

export default {
  uploadImage,
  uploadProductImage,
  uploadAvatar,
  uploadBlogImage,
  deleteImage,
};
