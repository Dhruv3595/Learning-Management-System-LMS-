// This file just logs the user's auth state to help with debugging

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check auth state in localStorage
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  
  if (window.location.hostname === 'localhost') {
    console.log("=== Auth Debugging Info ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("role:", role);
    console.log("Cookie available:", document.cookie ? "Yes" : "No");
  }
});