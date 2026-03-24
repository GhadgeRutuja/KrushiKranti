/**
 * Centralized Redux selectors.
 * Import from here — never access raw state.getState() in components.
 */
import type { RootState } from '../app/store';

// ────────────────────────────────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────────────────────────────────
export const selectUser = (s: RootState) => s.auth.user;
export const selectRole = (s: RootState) => s.auth.role ?? s.auth.user?.role ?? null;
export const selectToken = (s: RootState) => s.auth.token;
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectAuthLoading = (s: RootState) => s.auth.isLoading;
export const selectAuthError = (s: RootState) => s.auth.error;

// ────────────────────────────────────────────────────────────────────────────
// UI
// ────────────────────────────────────────────────────────────────────────────
export const selectDarkMode = (s: RootState) => s.ui.darkMode;
export const selectSidebarOpen = (s: RootState) => s.ui.sidebarOpen;
export const selectLanguage = (s: RootState) => s.ui.language;

// ────────────────────────────────────────────────────────────────────────────
// Products
// ────────────────────────────────────────────────────────────────────────────
export const selectProducts = (s: RootState) => s.product.products;
export const selectSelectedProduct = (s: RootState) => s.product.selectedProduct;
export const selectProductLoading = (s: RootState) => s.product.isLoading;
export const selectProductError = (s: RootState) => s.product.error;

// ────────────────────────────────────────────────────────────────────────────
// Cart
// ────────────────────────────────────────────────────────────────────────────
export const selectCartItems = (s: RootState) => s.cart.items;
export const selectCartSubtotal = (s: RootState) => s.cart.subtotal;
export const selectCartItemCount = (s: RootState) => s.cart.itemCount;

// ────────────────────────────────────────────────────────────────────────────
// Orders
// ────────────────────────────────────────────────────────────────────────────
export const selectOrders = (s: RootState) => s.orders.orders;
export const selectSelectedOrder = (s: RootState) => s.orders.selectedOrder;
export const selectOrderLoading = (s: RootState) => s.orders.isLoading;
export const selectOrderError = (s: RootState) => s.orders.error;
export const selectOrderFilters = (s: RootState) => s.orders.filters;
export const selectOrderPagination = (s: RootState) => s.orders.pagination;

// ────────────────────────────────────────────────────────────────────────────
// Chat
// ────────────────────────────────────────────────────────────────────────────
export const selectConversations = (s: RootState) => s.chat.conversations;
export const selectMessages = (s: RootState) => s.chat.messages;
export const selectActiveConversation = (s: RootState) => s.chat.activeConversation;
export const selectChatLoading = (s: RootState) => s.chat.isLoading;
export const selectIsTyping = (s: RootState) => s.chat.isTyping;

// ────────────────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────────────────
export const selectNotifications = (s: RootState) => s.notifications.notifications;
export const selectUnreadCount = (s: RootState) =>
    s.notifications.notifications.filter((n) => !n.isRead).length;

// ────────────────────────────────────────────────────────────────────────────
// Wishlist
// ────────────────────────────────────────────────────────────────────────────
export const selectWishlistItems = (s: RootState) => s.wishlist.items;
export const selectWishlistCount = (s: RootState) => s.wishlist.items.length;
export const selectIsInWishlist = (productId: string) =>
    (s: RootState) => s.wishlist.items.some((item) => item.id === productId);

// ────────────────────────────────────────────────────────────────────────────
// Blogs
// ────────────────────────────────────────────────────────────────────────────
export const selectBlogs = (s: RootState) => s.blog.blogs;
export const selectBlogDetails = (s: RootState) => s.blog.blogDetails;
export const selectBlogLoading = (s: RootState) => s.blog.loading;
export const selectBlogError = (s: RootState) => s.blog.error;

// ────────────────────────────────────────────────────────────────────────────
// Payment
// ────────────────────────────────────────────────────────────────────────────
export const selectPaymentStatus = (s: RootState) => s.payment.paymentStatus;
export const selectPaymentLoading = (s: RootState) => s.payment.paymentLoading;
export const selectPaymentError = (s: RootState) => s.payment.paymentError;
export const selectPaymentOrderId = (s: RootState) => s.payment.orderId;

// ────────────────────────────────────────────────────────────────────────────
// Farmer
// ────────────────────────────────────────────────────────────────────────────
export const selectFarmerStats = (s: RootState) => s.farmer.stats;
export const selectFarmerProducts = (s: RootState) => s.farmer.products;
// Farmer orders are usually accessed via the general orders slice filtered by role or specific API

// ────────────────────────────────────────────────────────────────────────────
// Wholesaler
// ────────────────────────────────────────────────────────────────────────────
export const selectWholesalerStats = (s: RootState) => s.wholesaler.stats;
export const selectBulkRequests = (s: RootState) => s.wholesaler.requests;
export const selectInventory = (s: RootState) => s.wholesaler.inventory;

// ────────────────────────────────────────────────────────────────────────────
// Admin
// ────────────────────────────────────────────────────────────────────────────
export const selectAdminUsers = (s: RootState) => s.admin.users;
export const selectAdminProducts = (s: RootState) => s.admin.products;
export const selectAdminStats = (s: RootState) => s.admin.stats;
export const selectAdminLoading = (s: RootState) => s.admin.isLoading;
