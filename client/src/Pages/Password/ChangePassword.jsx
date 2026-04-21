import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  KeyRound,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { changePassword } from "../../Redux/Slices/AuthSlice";

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [userPassword, setUserPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // Password validation
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  function handleUserInput(e) {
    const { name, value } = e.target;
    setUserPassword({
      ...userPassword,
      [name]: value,
    });

    // Check password strength for new password
    if (name === "newPassword") {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  }

  async function onChangePassword(event) {
    event.preventDefault();
    
    if (!userPassword.oldPassword || !userPassword.newPassword) {
      toast.error("Please fill all the fields");
      return;
    }

    if (userPassword.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (userPassword.oldPassword === userPassword.newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Changing password...");
    
    try {
      const response = await dispatch(changePassword(userPassword));
      if (response?.payload?.success) {
        toast.success("Password changed successfully!", { id: loadingToast });
        setUserPassword({
          oldPassword: "",
          newPassword: "",
        });
        setTimeout(() => {
          navigate("/user/profile");
        }, 1500);
      } else {
        toast.error(response?.payload?.message || "Failed to change password", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Something went wrong!", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  }

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score === 0) return { text: "", color: "" };
    if (score <= 2) return { text: "Weak", color: "text-red-600" };
    if (score <= 3) return { text: "Fair", color: "text-yellow-600" };
    if (score <= 4) return { text: "Good", color: "text-blue-600" };
    return { text: "Strong", color: "text-green-600" };
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <Layout hideFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Profile</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Change Password
            </h1>
            <p className="text-gray-600">Update your password to keep your account secure</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Security Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a strong, unique password</li>
                  <li>• Don&apos;t reuse passwords from other accounts</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </div>

            <form onSubmit={onChangePassword} className="space-y-6">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={userPassword.oldPassword}
                    onChange={handleUserInput}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your current password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={userPassword.newPassword}
                    onChange={handleUserInput}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {userPassword.newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Password Strength:</span>
                      <span className={`text-sm font-semibold ${strengthInfo.color}`}>
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= getPasswordStrengthScore()
                              ? level <= 2
                                ? "bg-red-500"
                                : level <= 3
                                ? "bg-yellow-500"
                                : level <= 4
                                ? "bg-blue-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {userPassword.newPassword && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: "length", text: "At least 8 characters" },
                        { key: "uppercase", text: "One uppercase letter" },
                        { key: "lowercase", text: "One lowercase letter" },
                        { key: "number", text: "One number" },
                      ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2">
                          {passwordStrength[req.key] ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`text-xs ${
                              passwordStrength[req.key] ? "text-green-700 font-medium" : "text-gray-500"
                            }`}
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !userPassword.oldPassword || !userPassword.newPassword}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !isLoading && userPassword.oldPassword && userPassword.newPassword
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>

              {/* Reset Password Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Forgot your password?{" "}
                  <Link
                    to="/user/profile/reset-password"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Reset it here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Additional Help */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              If you&apos;re having trouble changing your password or suspect unauthorized access to your account, please contact our support team immediately.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
