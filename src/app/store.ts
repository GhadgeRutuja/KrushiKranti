import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/authSlice';
import uiReducer from './uiSlice';
import productReducer from '../modules/product/productSlice';
import cartReducer from '../modules/cart/cartSlice';
import farmerReducer from '../modules/farmer/farmerSlice';
import wholesalerReducer from '../modules/wholesaler/wholesalerSlice';
import adminReducer from '../modules/admin/adminSlice';
import orderReducer from '../modules/orders/orderSlice';
import trackingReducer from '../modules/orders/trackingSlice';
import chatReducer from '../modules/chat/chatSlice';
import wishlistReducer from '../modules/wishlist/wishlistSlice';
import notificationReducer from '../modules/notifications/notificationSlice';
import blogReducer from '../modules/blog/blogSlice';
import paymentReducer from '../modules/payment/paymentSlice';
import bulkReducer from '../modules/bulk/bulkSlice';
import negotiationReducer from '../modules/bulk/negotiationSlice';
import adminContactMessagesReducer from '../modules/admin/contactMessagesSlice';
import eventsReducer from '../modules/events';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    product: productReducer,
    cart: cartReducer,
    farmer: farmerReducer,
    wholesaler: wholesalerReducer,
    admin: adminReducer,
    orders: orderReducer,
    tracking: trackingReducer,
    chat: chatReducer,
    wishlist: wishlistReducer,
    notifications: notificationReducer,
    blog: blogReducer,
    payment: paymentReducer,
    bulk: bulkReducer,
    negotiation: negotiationReducer,
    adminContactMessages: adminContactMessagesReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
