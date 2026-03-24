import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { cartService } from "./cartService";
import type {
  CartItemResponse,
  CartResponse,
  AddToCartRequest,
  UpdateCartRequest,
} from "./cartService";
import { getThunkErrorMessage } from "../../utils/errorHandler";

export interface CartState {
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (request: AddToCartRequest, { rejectWithValue }) => {
    try {
      await cartService.addToCart(request);
      // Fetch cart again to update the whole object, this is to ensure sync
      const fullCart = await cartService.getCart();
      return fullCart;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (request: UpdateCartRequest, { rejectWithValue }) => {
    try {
      await cartService.updateCartItem(request);
      const fullCart = await cartService.getCart();
      return fullCart;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      await cartService.removeCartItem(productId);
      const fullCart = await cartService.getCart();
      return fullCart;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return { items: [], cartTotal: 0, itemCount: 0 };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchCartItemCount = createAsyncThunk(
  "cart/fetchCount",
  async (_, { rejectWithValue }) => {
    try {
      const count = await cartService.getCartItemCount();
      return count;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.itemCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.isLoading = false;
          state.items = action.payload.items;
          state.subtotal = action.payload.cartTotal;
          state.itemCount = action.payload.itemCount;
        },
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to load your cart");
      })

      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addToCart.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.isLoading = false;
          state.items = action.payload.items;
          state.subtotal = action.payload.cartTotal;
          state.itemCount = action.payload.itemCount;
        },
      )
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(
          action,
          "Unable to add item to cart",
        );
      })

      // Update Quantity
      .addCase(updateQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateQuantity.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.isLoading = false;
          state.items = action.payload.items;
          state.subtotal = action.payload.cartTotal;
          state.itemCount = action.payload.itemCount;
        },
      )
      .addCase(updateQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(
          action,
          "Unable to update cart quantity",
        );
      })

      // Remove Item
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        removeCartItem.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.isLoading = false;
          state.items = action.payload.items;
          state.subtotal = action.payload.cartTotal;
          state.itemCount = action.payload.itemCount;
        },
      )
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(
          action,
          "Unable to remove item from cart",
        );
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        clearCart.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.isLoading = false;
          state.items = action.payload.items;
          state.subtotal = action.payload.cartTotal;
          state.itemCount = action.payload.itemCount;
        },
      )
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to clear your cart");
      })

      // Fetch Count
      .addCase(
        fetchCartItemCount.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.itemCount = action.payload;
        },
      )

      // Auto-clear cart on logout directly matching the action type
      .addMatcher(
        (action) => action.type === "auth/logout/fulfilled",
        (state) => {
          state.items = [];
          state.subtotal = 0;
          state.itemCount = 0;
          state.error = null;
        },
      );
  },
});

export const { clearError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
