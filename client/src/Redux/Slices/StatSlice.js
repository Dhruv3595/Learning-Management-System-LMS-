import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
    allUsersCount: 0,
    subscribedCount: 0,
    revenueData: [],
    totalRevenue: 0,
    courseDistribution: [],
    totalCourses: 0,
    userRegistrations: []
};

// ......get stats data......
export const getStatsData = createAsyncThunk("stats/get", async () => {
    try {
        const response = await axiosInstance.get(
          "/admin/stats"
        );
        return response?.data;
    } catch (error) {
        if (error.response?.status === 401) {
            console.warn("Authentication required for stats");
        } else {
            toast.error("Failed to get stats");
        }
        throw error
    }
})

// ......get revenue stats data......
export const getRevenueStats = createAsyncThunk("stats/revenue", async () => {
    try {
        const response = await axiosInstance.get(
          "/admin/stats/revenue"
        );
        return response?.data;
    } catch (error) {
        toast.error("Failed to get revenue stats");
        throw error
    }
})

// ......get course stats data......
export const getCourseStats = createAsyncThunk("stats/courses", async () => {
    try {
        const response = await axiosInstance.get(
          "/admin/stats/courses"
        );
        return response?.data;
    } catch (error) {
        toast.error("Failed to get course stats");
        throw error
    }
})

const statSlice = createSlice({
    name: "state",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getStatsData.fulfilled, (state, action) => {
            const stats = action?.payload?.stats || {};
            state.allUsersCount = stats.totalUsers || 0;
            state.subscribedCount = stats.subscribedUsers || 0;
            state.userRegistrations = stats.userRegistrations || [];
        });
        builder.addCase(getStatsData.rejected, (state) => {
            // Keep initial values on error
            state.allUsersCount = 0;
            state.subscribedCount = 0;
        });
        builder.addCase(getRevenueStats.fulfilled, (state, action) => {
            state.revenueData = action?.payload?.revenueData || [];
            state.totalRevenue = action?.payload?.totalRevenue || 0;
        });
        builder.addCase(getCourseStats.fulfilled, (state, action) => {
            state.courseDistribution = action?.payload?.courseDistribution || [];
            state.totalCourses = action?.payload?.totalCourses || 0;
        });
    }
});

export default statSlice.reducer;