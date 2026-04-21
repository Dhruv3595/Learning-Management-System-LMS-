import React, { useEffect, useRef, useState } from "react";
import { 
  Camera, 
  Mail, 
  User as UserIcon, 
  Shield, 
  Lock, 
  RefreshCw, 
  Check, 
  Calendar,
  Edit2,
  Sparkles
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../../Layout/Layout";
import { getUserData, updateUserData } from "../../Redux/Slices/AuthSlice";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    avatar: null,
    previewImage: null,
    userId: null,
  });
  const avatarInputRef = useRef(null);
  const [isChanged, setIschanged] = useState(false);

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      // Validate file size (max 5MB)
      if (uploadImage.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          avatar: uploadImage,
        });
        setIsEditing(true);
      });
    }
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    if (!isChanged) return;
    
    // Validate full name doesn't contain numbers
    if (/\d/.test(userInput.name)) {
      toast.error("Full name cannot contain numbers");
      return;
    }
    
    setIsUpdating(true);
    const loadingToast = toast.loading("Updating profile...");

    try {
      const formData = new FormData();
      formData.append("fullName", userInput.name);
      if (userInput.avatar) {
        formData.append("avatar", userInput.avatar);
      }
      const data = { formData, id: userInput.userId };
      const response = await dispatch(updateUserData(data));
      
      if (response?.payload?.success) {
        await dispatch(getUserData());
        setIschanged(false);
        setIsEditing(false);
        toast.success("Profile updated successfully!", { id: loadingToast });
      } else {
        toast.error("Failed to update profile", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Something went wrong!", { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    setIschanged(userInput.name !== userData?.fullName || userInput.avatar);
  }, [userInput, userData?.fullName]);

  useEffect(() => {
    async function fetchUser() {
      if (Object.keys(userData).length < 1) {
        await dispatch(getUserData());
      }
    }
    fetchUser();
  }, [dispatch, userData]);

  useEffect(() => {
    if (userData) {
      setUserInput({
        ...userInput,
        name: userData?.fullName || "",
        userId: userData?._id || null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const memberSince = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A";

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              My Profile
            </h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                </div>

                {/* Profile Image */}
                <div className="relative -mt-16 px-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                      {userData?.avatar?.secure_url || userInput.previewImage ? (
                        <img
                          src={userInput.previewImage || userData?.avatar?.secure_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <UserIcon className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current.click()}
                      className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      title="Change avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      accept=".png, .jpeg, .jpg"
                      className="hidden"
                      ref={avatarInputRef}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {userData?.fullName || "User"}
                  </h2>
                  <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {userData?.email || ""}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-medium">Role</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {userData?.role || "USER"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Member Since</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {memberSince}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-6 py-4 bg-gray-50 space-y-2">
                  <button
                    onClick={() => navigate("change-password")}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-blue-600 hover:border-blue-300"
                  >
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Change Password</span>
                  </button>
                  <button
                    onClick={() => navigate("reset-password")}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-purple-600 hover:border-purple-300"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="font-medium">Reset Password</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Edit2 className="w-6 h-6 text-blue-600" />
                    Edit Profile
                  </h3>
                  {isEditing && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      Unsaved Changes
                    </span>
                  )}
                </div>

                <form onSubmit={onFormSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userInput.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Check if the value contains any numbers
                          if (/\d/.test(value)) {
                            toast.error("Full name cannot contain numbers");
                            return;
                          }
                          setUserInput({ ...userInput, name: value });
                          setIsEditing(true);
                        }}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={userData?.email || ""}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData?.role || "USER"}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={!isChanged || isUpdating}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isChanged && !isUpdating
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserInput({
                            name: userData?.fullName || "",
                            avatar: null,
                            previewImage: null,
                            userId: userData?._id || null,
                          });
                          setIsEditing(false);
                          setIschanged(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
