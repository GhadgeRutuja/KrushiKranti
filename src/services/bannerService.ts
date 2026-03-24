import api from "./api";

const API_BASE_URL = "";

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  redirectUrl: string;
  isActive: boolean;
}

export interface CreateBannerPayload {
  title: string;
  subtitle?: string;
  buttonText?: string;
  redirectUrl: string;
  isActive: boolean;
  imageFile: File;
}

export const bannerService = {
  /**
   * Fetch active banners for homepage carousel
   * Falls back gracefully if API is unavailable
   */
  async getActiveBanners(): Promise<Banner[]> {
    try {
      const response = await api.get<Banner[]>(
        `${API_BASE_URL}/banners/active`,
        {
          timeout: 5000, // 5 second timeout
        },
      );

      // Filter and return only active banners
      return response.data?.filter((banner) => banner.isActive) || [];
    } catch (error) {
      console.warn("Failed to fetch banners from API:", error);
      // Return empty array - BannerCarousel will use fallback static banners
      return [];
    }
  },

  // Backward-compatible alias
  async getBanners(): Promise<Banner[]> {
    return this.getActiveBanners();
  },

  /**
   * Fetch a single banner by ID
   */
  async getBannerById(id: number): Promise<Banner | null> {
    try {
      const response = await api.get<Banner>(`${API_BASE_URL}/banners/${id}`, {
        timeout: 5000,
      });
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch banner:", error);
      return null;
    }
  },

  /**
   * Fetch all banners (including inactive) for admin panel
   */
  async getAllBanners(): Promise<Banner[]> {
    try {
      const response = await api.get<Banner[]>(
        `${API_BASE_URL}/banners/admin/all`,
        {
          timeout: 5000,
        },
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch all banners:", error);
      throw error;
    }
  },

  /**
   * Create a new banner (Admin only)
   */
  async createBanner(payload: CreateBannerPayload): Promise<Banner | null> {
    try {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("subtitle", payload.subtitle || "");
      formData.append("buttonText", payload.buttonText || "Shop Now");
      formData.append("redirectUrl", payload.redirectUrl);
      formData.append("isActive", String(payload.isActive));
      formData.append("image", payload.imageFile);

      const response = await api.post<Banner>(
        `${API_BASE_URL}/banners`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data || null;
    } catch (error) {
      console.error("Failed to create banner:", error);
      throw error;
    }
  },

  /**
   * Update an existing banner (Admin only)
   */
  async updateBanner(
    id: number,
    banner: Partial<Banner>,
  ): Promise<Banner | null> {
    try {
      const response = await api.put<Banner>(
        `${API_BASE_URL}/banners/${id}`,
        banner,
      );
      return response.data || null;
    } catch (error) {
      console.error("Failed to update banner:", error);
      throw error;
    }
  },

  /**
   * Delete a banner (Admin only)
   */
  async deleteBanner(id: number): Promise<boolean> {
    try {
      await api.delete(`${API_BASE_URL}/banners/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete banner:", error);
      throw error;
    }
  },

  /**
   * Toggle active status of a banner (Admin only)
   */
  async toggleBanner(id: number): Promise<Banner | null> {
    try {
      const response = await api.patch<Banner>(
        `${API_BASE_URL}/banners/${id}/toggle`,
      );
      return response.data || null;
    } catch (error) {
      console.error("Failed to toggle banner:", error);
      throw error;
    }
  },
};
