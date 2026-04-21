import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
    orders: [],
    currentOrder: null,
    orderStats: {
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        pendingOrders: 0
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
    },
    loading: false,
    error: null
};

// Get user's orders with real-time filtering
export const getMyOrders = createAsyncThunk("/orders/getMyOrders", async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Default to only showing completed and paid orders
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        if (params.paymentStatus && params.paymentStatus !== 'all') queryParams.append('paymentStatus', params.paymentStatus);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.orderType && params.orderType !== 'all') queryParams.append('orderType', params.orderType);

        console.log("Fetching orders with params:", params);
        const response = await axiosInstance.get(`/orders/my-orders?${queryParams}`);
        
        console.log("Orders response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Get orders error:", error);
        toast.error(error?.response?.data?.message || "Failed to fetch orders");
        throw error;
    }
});

// Get specific order by ID
export const getOrderById = createAsyncThunk("/orders/getOrderById", async (orderId) => {
    try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch order details");
        throw error;
    }
});

// Get order statistics
export const getOrderStats = createAsyncThunk("/orders/getOrderStats", async () => {
    try {
        const response = await axiosInstance.get("/orders/stats");
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch order statistics");
        throw error;
    }
});

// Search orders with better filtering
export const searchOrders = createAsyncThunk("/orders/searchOrders", async (params) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.query) queryParams.append('query', params.query);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        console.log("Searching orders with params:", params);
        const response = await axiosInstance.get(`/orders/search?${queryParams}`);
        
        console.log("Search response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Search orders error:", error);
        toast.error(error?.response?.data?.message || "Search failed");
        throw error;
    }
});

// Create order (used during purchase)
export const createOrder = createAsyncThunk("/orders/createOrder", async (orderData) => {
    try {
        const response = await axiosInstance.post("/orders/create", orderData);
        toast.success("Order created successfully");
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to create order");
        throw error;
    }
});

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearOrders: (state) => {
            state.orders = [];
            state.currentOrder = null;
            state.pagination = initialState.pagination;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        setOrderFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetOrderError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get My Orders
            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload?.data?.orders || [];
                state.pagination = action.payload?.data?.pagination || initialState.pagination;
                console.log("Orders updated in state:", state.orders.length, "orders loaded");
                console.log("First order sample:", state.orders[0]);
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Get Order by ID
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Get Order Stats
            .addCase(getOrderStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrderStats.fulfilled, (state, action) => {
                state.loading = false;
                state.orderStats = action.payload.data;
            })
            .addCase(getOrderStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Search Orders
            .addCase(searchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload?.data?.orders || action.payload?.data || [];
                console.log("Search orders updated:", state.orders.length, "orders found");
            })
            .addCase(searchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
                // Add to orders array if it exists
                if (state.orders.length > 0) {
                    state.orders.unshift(action.payload.data);
                }
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { 
    clearOrders, 
    clearCurrentOrder, 
    setOrderFilters, 
    resetOrderError 
} = orderSlice.actions;

export default orderSlice.reducer;