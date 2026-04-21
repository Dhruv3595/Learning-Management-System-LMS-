import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  role: localStorage.getItem("role") || "",
  data: (() => {
    try {
      const storedData = localStorage.getItem("data");
      return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return {};
    }
  })(),
};

// .....signup.........
export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
  const loadingMessage = toast.loading("Please wait! creating your account...");
  try {
    const res = await axiosInstance.post("/user/register", data);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// .....Login.........
export const login = createAsyncThunk("/auth/login", async (data) => {
  const loadingMessage = toast.loading(
    "Please wait! logging into your account..."
  );
  try {
    const res = await axiosInstance.post("/user/login", data);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// .....Logout.........
export const logout = createAsyncThunk("/auth/logout", async () => {
  const loadingMessage = toast.loading("logout...");
  try {
    const res = await axiosInstance.get("/user/logout");
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    // Even if backend request fails, we should still logout on frontend
    console.log("Logout request failed, but clearing local session:", error.message);
    toast.success("Logged out successfully", { id: loadingMessage });
    return { success: true, message: "Logged out successfully" };
  }
});

// .....get user data.........
export const getUserData = createAsyncThunk("/auth/user/me", async () => {
  try {
    const res = await axiosInstance.get("/user/me");
    // Save role to localStorage when we fetch user data
    if (res?.data?.success && res?.data?.user?.role) {
      localStorage.setItem("role", res?.data?.user?.role);
    }
    return res?.data;
  } catch (error) {
    // If it's a connection error, don't show error message
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.log("Server not available, using cached user data");
      throw error; // Let Redux handle this silently
    }
    // For other errors, show the error message
    const errorMessage = error?.response?.data?.message || "Failed to fetch profile";
    throw new Error(errorMessage);
  }
});

// .....update user data.........
export const updateUserData = createAsyncThunk(
  "/auth/user/me",
  async (data) => {
    const loadingMessage = toast.loading("Updating changes...");
    try {
      const res = await axiosInstance.post(
        `/user/update/${data.id}`,
        data.formData
      );
      toast.success(res?.data?.message, { id: loadingMessage });
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: loadingMessage });
      throw error;
    }
  }
);

// .....Google authentication.......
export const googleAuth = createAsyncThunk("/auth/google", async (authData) => {
  const loadingMessage = toast.loading("Signing in with Google...");
  try {
    const res = await axiosInstance.post("/auth/google", authData);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Google authentication failed";
    toast.error(errorMessage, { id: loadingMessage });
    throw error;
  }
});

// .....check course access.........
export const checkCourseAccess = createAsyncThunk(
  "auth/checkCourseAccess",
  async (courseId) => {
    try {
      const res = await axiosInstance.get(`/payments/course-access/${courseId}`);
      return res?.data;
    } catch (error) {
      // Don't show error message for expected errors (like not having access)
      if (error.response?.status === 403) {
        return { hasAccess: false };
      }
      // For other errors (network, server, etc), show the error
      const errorMessage = error?.response?.data?.message || "Failed to check course access";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// .....get user enrollments.........
export const getUserEnrollments = createAsyncThunk("/auth/enrollments", async () => {
  try {
    const res = await axiosInstance.get("/payments/my-enrollments");
    return res?.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to fetch enrollments";
    throw new Error(errorMessage);
  }
});

// .....purchase individual course.........  
export const purchaseIndividualCourse = createAsyncThunk("/course/purchase", async (purchaseData) => {
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
});// .....change user password.......
export const changePassword = createAsyncThunk(
  "/auth/user/changePassword",
  async (userPassword) => {
    const loadingMessage = toast.loading("Changing password...");
    try {
      const res = await axiosInstance.post(
        "/user/change-password",
        userPassword
      );
      toast.success(res?.data?.message, { id: loadingMessage });
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: loadingMessage });
      throw error;
    }
  }
);

// .....forget user password.....
export const forgetPassword = createAsyncThunk(
  "auth/user/forgetPassword",
  async (email) => {
    const loadingMessage = toast.loading("Please Wait! sending email...");
    try {
      const res = await axiosInstance.post("/user/reset", { email });
      toast.success(res?.data?.message, { id: loadingMessage });
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: loadingMessage });
      throw error;
    }
  }
);

// .......reset the user password......
export const resetPassword = createAsyncThunk("/user/reset", async (data) => {
  const loadingMessage = toast.loading(
    "Please Wait! reseting your password..."
  );
  try {
    const res = await axiosInstance.post(
      `/user/reset/${data.resetToken}`,
      {
        password: data.password,
      }
    );
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // for signup
    builder.addCase(createAccount.fulfilled, (state, action) => {
      localStorage.setItem("data", JSON.stringify(action?.payload?.user));
      localStorage.setItem("role", action?.payload?.user?.role);
      localStorage.setItem("isLoggedIn", true);
      state.data = action?.payload?.user;
      state.role = action?.payload?.user?.role;
      state.isLoggedIn = true;
    });

    // for login
    builder.addCase(login.fulfilled, (state, action) => {
      localStorage.setItem("data", JSON.stringify(action?.payload?.user));
      localStorage.setItem("role", action?.payload?.user?.role || "");
      localStorage.setItem("isLoggedIn", true);
      state.data = action?.payload?.user;
      state.role = action?.payload?.user?.role;
      state.isLoggedIn = true;
    });

    // for logout
    builder.addCase(logout.fulfilled, (state) => {
      localStorage.removeItem("data");
      localStorage.removeItem("role");
      localStorage.removeItem("isLoggedIn");
      state.data = {};
      state.role = "";
      state.isLoggedIn = false;
    });

    // for Google auth
    builder.addCase(googleAuth.fulfilled, (state, action) => {
      localStorage.setItem("data", JSON.stringify(action?.payload?.user));
      localStorage.setItem("role", action?.payload?.user?.role);
      localStorage.setItem("isLoggedIn", true);
      state.data = action?.payload?.user;
      state.role = action?.payload?.user?.role;
      state.isLoggedIn = true;
    });

    // for get user data
    builder.addCase(getUserData.fulfilled, (state, action) => {
      localStorage.setItem("data", JSON.stringify(action?.payload?.user));
      localStorage.setItem("role", action?.payload?.user?.role);
      localStorage.setItem("isLoggedIn", true);
      state.data = action?.payload?.user;
      state.role = action?.payload?.user?.role;
      state.isLoggedIn = true;
    });
  },
});

export default authSlice.reducer;
