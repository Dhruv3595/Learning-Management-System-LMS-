import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
  key: "",
  subscription_id: "",
  isPaymentVerified: false,
  allPayments: [], // Changed from {} to [] since backend returns array
  finalMonths: {},
  monthlySalesRecord: [],
};

// ....get razorpay key id.....
export const getRazorPayId = createAsyncThunk("/payments/keyId", async () => {
  try {
    const response = await axiosInstance.get(
      "/payments/razorpay-key"
    );
    return response?.data;
  } catch (error) {
    toast.error("Failed to load data");
    throw error;
  }
});

// ....purchase course bundle.....
export const purchaseCourseBundle = createAsyncThunk(
  "/payments/subscribe",
  async () => {
    try {
      const response = await axiosInstance.post(
        "/payments/subscribe"
      );
      return response?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      throw error;
    }
  }
);

// ....verify payment.....
export const verifyUserPayment = createAsyncThunk(
  "/payments/verify",
  async (data) => {
    const loadingId = toast.loading("Subscribing bundle...");
    try {
      const response = await axiosInstance.post(
        "/payments/verify",
        data
      );
      toast.success("Payment verified", { id: loadingId });
      return response?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: loadingId });
      throw error;
    }
  }
);

export const transectionUserPayment = createAsyncThunk(
  "/payments/transection",
  async (data) => {
    const loadingId = toast.loading("Transection...");
    try {
      const response = await axiosInstance.post(
        "/payments/transection",
        data
      );
      toast.success("Payment verified", { id: loadingId });
      return response?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: loadingId });
      throw error;
    }
  }
);
// .....get payment record......
export const getPaymentRecord = createAsyncThunk(
  "/payments/record",
  async () => {
    try {
      const response = await axiosInstance.get(
        "/payments?count=1"
      );
      return response?.data;
    } catch (error) {
      // Don't show error toast for authentication failures
      if (error.response?.status === 401) {
        console.warn("Authentication required for payment records");
      } else {
        toast.error("Failed to load payment records");
      }
      throw error;
    }
  }
);

// .....cancel subscription......
export const cancelCourseBundle = createAsyncThunk(
  "/payments/cancel",
  async () => {
    const loadingId = toast.loading("unsubscribing the bundle...");
    try {
      const response = await axiosInstance.post(
        "/payments/unsubscribe"
      );
      toast.success(response?.data?.message, { id: loadingId });
      return response?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: loadingId });
      throw error;
    }
  }
);

const razoraySlice = createSlice({
  name: "razorpay",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // for ge tRazorPay Api Key
    builder.addCase(getRazorPayId.fulfilled, (state, action) => {
      state.key = action?.payload?.key;
    });

    // for purchase course bundle
    builder.addCase(purchaseCourseBundle.fulfilled, (state, action) => {
      state.subscription_id = action?.payload?.subscription_id;
    });

    // for verify payment
    builder.addCase(verifyUserPayment.fulfilled, (state, action) => {
      state.isPaymentVerified = action?.payload?.success;
    });

    // for transaction payment (direct payment)
    builder.addCase(transectionUserPayment.fulfilled, (state, action) => {
      state.isPaymentVerified = action?.payload?.success;
    });

    // for getPaymentRecord
    builder.addCase(getPaymentRecord.fulfilled, (state, action) => {
      state.allPayments = action?.payload?.allPayments || [];
      state.finalMonths = action?.payload?.finalMonths || {};
      state.monthlySalesRecord = action?.payload?.monthlySalesRecord || [];
    });
    
    // Handle payment record errors
    builder.addCase(getPaymentRecord.rejected, (state) => {
      // Keep initial state values on error
      state.allPayments = [];
      state.finalMonths = {};
      state.monthlySalesRecord = [];
    });
  },
});

export default razoraySlice.reducer;
