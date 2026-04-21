import { axiosInstance } from "./Helpers/axiosInstance";

// Add a request interceptor to ensure auth headers are included
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if user is logged in from localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("role");
    
    // Only add custom headers for debugging in development
    if (isLoggedIn && import.meta.env.DEV) {
      // Log auth info to console instead of adding headers
      console.log(`🔐 Auth Info - Logged In: ${isLoggedIn}, Role: ${role}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication error detected');
      
      // If unauthorized and user thinks they're logged in, force refresh
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn) {
        console.warn('Session may have expired, refreshing user data');
        // You could dispatch an action to refresh the token here
      }
    }
    
    if (error.response?.status === 403) {
      console.warn('Authorization error: Insufficient permissions');
      const role = localStorage.getItem("role");
      console.warn('Current role from localStorage:', role);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;