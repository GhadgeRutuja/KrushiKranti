import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trackingService, type TrackingInfo, type ShipmentInfo } from './trackingService';

interface TrackingState {
  trackingInfo: TrackingInfo | null;
  shipmentInfo: ShipmentInfo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TrackingState = {
  trackingInfo: null,
  shipmentInfo: null,
  isLoading: false,
  error: null,
};

export const fetchOrderTracking = createAsyncThunk(
  'tracking/fetchOrderTracking',
  async (orderId: string | number, { rejectWithValue }) => {
    try {
      const tracking = await trackingService.getOrderTracking(orderId);
      return tracking;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createShipment = createAsyncThunk(
  'tracking/createShipment',
  async (orderId: string | number, { rejectWithValue }) => {
    try {
      const shipment = await trackingService.createShipment(orderId);
      return shipment;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tracking
      .addCase(fetchOrderTracking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trackingInfo = action.payload;
      })
      .addCase(fetchOrderTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create shipment
      .addCase(createShipment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shipmentInfo = action.payload;
      })
      .addCase(createShipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTrackingInfo } = trackingSlice.actions;
export default trackingSlice.reducer;
