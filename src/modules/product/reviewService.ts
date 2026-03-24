import api from "../../services/api";
import type { Review } from "./types";
import { getErrorMessage } from "../../utils/errorHandler";

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  /**
   * Get all reviews for a product
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const response = await api.get<{
        data: Array<{
          id: number;
          productId: number;
          userId: number;
          userName: string;
          userProfileImage?: string;
          rating: number;
          comment: string;
          createdAt: string;
        }>;
      }>(`/reviews/product/${productId}`);

      return response.data.data.map((r) => ({
        id: String(r.id),
        userId: String(r.userId),
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load reviews"));
    }
  },

  /**
   * Create a new review (User only)
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    try {
      const response = await api.post<{
        data: {
          id: number;
          productId: number;
          userId: number;
          userName: string;
          rating: number;
          comment: string;
          createdAt: string;
        };
      }>("/reviews", {
        productId: parseInt(data.productId),
        rating: data.rating,
        comment: data.comment,
      });

      const r = response.data.data;
      return {
        id: String(r.id),
        userId: String(r.userId),
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to submit review"));
    }
  },

  /**
   * Delete a review (User/Admin only)
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to delete review"));
    }
  },
};
