import { ArrowLeft, CheckCircle,Mail, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { forgetPassword } from "../../Redux/Slices/AuthSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Determine back button destination
  const backDestination = isLoggedIn ? "/user/profile" : "/login";
  const backText = isLoggedIn ? "Back to Profile" : "Back to Login";

  async function onForgotPassword(event) {
    event.preventDefault();
    if (!email) {
      toast.error("Email is required to reset password!");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await dispatch(forgetPassword(email));

      if (response?.payload?.success) {
        setEmailSent(true);
        setEmail("");

        // Handle development mode (when SMTP is not configured)
        if (response?.payload?.development || response?.payload?.resetToken) {
          toast.success("Reset token generated! Check your browser console for the reset link.", {
            duration: 8000,
          });

          console.log("🔑 FORGOT PASSWORD - DEVELOPMENT MODE");
          console.log("=====================================");
          console.log("Reset Token:", response.payload.resetToken);
          console.log("Reset URL:", response.payload.resetURL);
          console.log("=====================================");
          console.log("Copy the Reset URL above and paste it in your browser to reset your password.");
          console.log("Or use the token in the reset password form.");

          // Show instructions in a more prominent way
          setTimeout(() => {
            alert(`Development Mode: Reset token generated!\n\nCheck your browser console (F12) for the reset link.\n\nReset Token: ${response.payload.resetToken}`);
          }, 1000);

        } else {
          // Production mode - email sent
          toast.success("Password reset link sent to your email!", {
            duration: 5000,
          });
        }
      } else {
        toast.error(response?.payload?.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error?.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout hideFooter={true}>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-300/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-pink-300/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link
              to={backDestination}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {backText}
            </Link>

            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Forgot Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Password?
                </span>
              </h1>
              <p className="text-xl text-white/90 max-w-lg mx-auto">
                No worries! Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              {!emailSent ? (
                <form
                  onSubmit={onForgotPassword}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Reset Link...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Send Reset Link
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Reset Link Generated!</h3>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 font-medium mb-2">🔧 Development Mode Active</p>
                    <p className="text-white/90 text-sm">
                      SMTP is not configured. Check your browser console (F12) for the reset token and direct link.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/70">
                      Copy the reset URL from console and paste it in your browser to reset your password.
                    </p>
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
                    >
                      Try another email
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <p className="text-white/80">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-indigo-300 hover:text-indigo-200 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
