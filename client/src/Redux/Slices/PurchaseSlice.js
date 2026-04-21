import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
  isLoading: false,
  purchaseData: null,
  error: null
};

// Purchase individual course
export const purchaseIndividualCourse = createAsyncThunk(
  "/payment/purchase-course", 
  async (purchaseData) => {
    const loadingMessage = toast.loading("Processing your purchase...");
    try {
      const res = await axiosInstance.post("/payments/purchase-course", purchaseData);
      toast.success(res?.data?.message, { id: loadingMessage });
      return res?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Purchase failed";
      toast.error(errorMessage, { id: loadingMessage });
      throw new Error(errorMessage);
    }
  }
);

const courseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    clearPurchaseData: (state) => {
      state.purchaseData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseIndividualCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(purchaseIndividualCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchaseData = action.payload;
        state.error = null;
      })
      .addCase(purchaseIndividualCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.purchaseData = null;
      });
  },
});

export const { clearPurchaseData } = courseSlice.actions;
export default courseSlice.reducer;