import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

// Get all users
export const getAllUsers = createAsyncThunk("/admin/users", async () => {
  try {
    const res = await axiosInstance.get("/admin/users");
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to fetch users");
    throw error;
  }
});

// Delete user
export const deleteUser = createAsyncThunk("/admin/users/delete", async (userId) => {
  const loadingMessage = toast.loading("Deleting user...");
  try {
    const res = await axiosInstance.delete(`/admin/users/${userId}`);
    toast.success("User deleted successfully", { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to delete user", { id: loadingMessage });
    throw error;
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action?.payload?.users || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default adminSlice.reducer;