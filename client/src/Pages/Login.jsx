import { ArrowRight,Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect,useState } from "react";
import { toast } from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../Layout/Layout";
import { googleAuth,login } from "../Redux/Slices/AuthSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  function handleUserInput(e) {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  }

  async function onLogin(event) {
    event.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill all the details");
      return;
    }

    setIsLoading(true);
    const Data = { email: loginData.email, password: loginData.password };

    try {
      // dispatch login action
      const response = await dispatch(login(Data));
      if (response?.payload?.success) {
        const userRole = response?.payload?.user?.role;
        toast.success("Login successful! Welcome back!");
        setLoginData({
          email: "",
          password: "",
        });
        
        // Redirect based on user role
        if (userRole === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(response?.payload?.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Demo Google login with account selection modal
  async function handleGoogleLogin() {
    // Show account selection modal
    const selectedAccount = await showGoogleAccountModal();
    
    if (selectedAccount) {
      try {
        const result = await dispatch(googleAuth({ 
          userInfo: selectedAccount, 
          type: 'login' 
        }));
        
        if (result?.payload?.success) {
          const userRole = result?.payload?.user?.role;
          toast.success(`Welcome back, ${selectedAccount.name}!`);
          // Redirect based on user role
          if (userRole === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Login failed. Please try again.');
      }
    }
  }

  // Function to show Google account selection modal
  function showGoogleAccountModal() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `;
      
      const accounts = [
        { id: '1', name: 'John Doe', email: 'john.doe@gmail.com', picture: 'https://i.pravatar.cc/150?u=john' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@gmail.com', picture: 'https://i.pravatar.cc/150?u=jane' },
        { id: '3', name: 'Your Account', email: 'your.email@gmail.com', picture: 'https://i.pravatar.cc/150?u=demo' }
      ];
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style="width: 20px; height: 20px; margin-right: 12px;">
            <h3 style="margin: 0; font-size: 18px; color: #333;">Choose an account</h3>
          </div>
          <div id="account-list">
            ${accounts.map(account => `
              <div class="account-item" data-account='${JSON.stringify(account)}' style="
                display: flex;
                align-items: center;
                padding: 12px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: background-color 0.2s;
              " onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='white'">
                <img src="${account.picture}" alt="${account.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;">
                <div>
                  <div style="font-weight: 500; color: #333;">${account.name}</div>
                  <div style="font-size: 14px; color: #666;">${account.email}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 16px; text-align: right;">
            <button id="cancel-btn" style="
              background: none;
              border: 1px solid #dadce0;
              color: #3c4043;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 8px;
            ">Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add click handlers
      modal.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', () => {
          const account = JSON.parse(item.dataset.account);
          document.body.removeChild(modal);
          resolve(account);
        });
      });
      
      modal.querySelector('#cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(null);
      });
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(null);
        }
      });
    });
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] flex overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-4">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className={`text-center space-y-8 transition-all duration-1000 transform ${
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LMS</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-bounce"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                LMS Pro
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
              Unlock your potential with our premium learning platform. Join thousands of learners advancing their careers.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm">Active Learners</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm">Courses</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className={`w-full max-w-md transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-300 text-sm">
                Sign in to continue your learning journey
              </p>
            </div>

            {/* Social Login (Google Only) */}
            <div className="space-y-3">
              <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 hover:scale-[1.02] group">
                <FaGoogle className="text-red-400 text-lg group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">Continue with Google</span>
              </button>
              {/* Hidden div for Google button rendering */}
              <div id="google-signin-button" className="hidden"></div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">or continue with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={onLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleUserInput}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleUserInput}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link to="/user/profile/reset-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-300 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
