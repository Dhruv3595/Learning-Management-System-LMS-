import React, { useEffect,useState } from "react";
import toast from "react-hot-toast";
import {
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
  AiOutlineFileText,
  AiOutlineTag,
  AiOutlineUpload} from "react-icons/ai";
import { BsImageFill } from "react-icons/bs";
import {
  FaBook,
  FaChalkboardTeacher,
  FaCloudUploadAlt,
  FaCrown,
  FaGraduationCap,
  FaImage,
  FaSpinner} from "react-icons/fa";
import { 
  HiOutlinePhotograph,
  HiOutlineSparkles} from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../Layout/AdminLayout";
import { createNewCourse } from "../../Redux/Slices/CourseSlice";

export default function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const { isLoggedIn, role } = useSelector((state) => state?.auth);
  
  // Check if user is admin on component mount
  useEffect(() => {
    if (!isLoggedIn || role !== "ADMIN") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
  }, [isLoggedIn, role, navigate]);

  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [userInput, setUserInput] = useState({
    title: "",
    category: "",
    createdBy: "",
    description: "",
    price: "",
    thumbnail: null,
    previewImage: "",
  });

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          thumbnail: uploadImage,
        });
      });
    }
  }

  function handleUserInput(e) {
    const { name, value } = e.target;
    
    // Special handling for price to ensure it's always a valid integer
    if (name === 'price') {
      const numericValue = value.replace(/[^0-9]/g, ''); // Only allow numbers
      setUserInput({
        ...userInput,
        [name]: numericValue,
      });
    } else {
      setUserInput({
        ...userInput,
        [name]: value,
      });
    }
  }

  async function onFormSubmit(e) {
    e.preventDefault();

    if (
      !userInput.title ||
      !userInput.description ||
      !userInput.category ||
      !userInput.createdBy ||
      !userInput.thumbnail ||
      !userInput.price
    ) {
      toast.error("All fields are required!");
      return;
    }

    setIsCreatingCourse(true);
    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    formData.append("category", userInput.category);
    formData.append("createdBy", userInput.createdBy);
    formData.append("thumbnail", userInput.thumbnail);
    // Ensure price is sent as integer
    formData.append("price", parseInt(userInput.price));

    const response = await dispatch(createNewCourse(formData));
    if (response?.payload?.success) {
      setUserInput({
        title: "",
        category: "",
        createdBy: "",
        description: "",
        price: "",
        thumbnail: null,
        previewImage: "",
      });
    }
    setIsCreatingCourse(false);
  }

  return (
    <AdminLayout>
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 xs:py-16 sm:py-20">
          <div className="flex items-center gap-2 xs:gap-4 mb-6 xs:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 px-3 xs:px-4 py-2 xs:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 text-white text-sm xs:text-base"
            >
              <AiOutlineArrowLeft className="text-base xs:text-lg group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium hidden xs:inline">Back</span>
            </button>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4 xs:mb-6">
              <div className="p-3 xs:p-4 bg-white/10 backdrop-blur-sm rounded-full">
                <FaGraduationCap className="text-2xl xs:text-3xl sm:text-4xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 xs:mb-6 leading-tight px-4 xs:px-0">
              Create Your{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Premium Course
              </span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed px-4 xs:px-0">
              Share your expertise with learners worldwide. Build engaging courses that inspire and educate.
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 py-8 xs:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={onFormSubmit}
            autoComplete="off"
            noValidate
            encType="multipart/form-data"
            className="bg-white dark:bg-gray-800 rounded-xl xs:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 xs:p-6 sm:p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 xs:gap-12">
                
                {/* Left Section - Course Media */}
                <div className="space-y-8">
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl mb-4">
                      <HiOutlinePhotograph className="text-2xl text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-gray-800 dark:text-white">Course Media</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Visual Content
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Upload engaging visuals to attract students
                    </p>
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <FaImage className="text-purple-500" />
                      Course Thumbnail *
                    </h3>
                    <div className="relative group">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl aspect-video flex flex-col justify-center items-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 overflow-hidden">
                        {userInput.previewImage ? (
                          <div className="relative w-full h-full">
                            <img
                              src={userInput.previewImage}
                              alt="Course thumbnail preview"
                              className="w-full h-full object-cover rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl">
                              <div className="text-center text-white">
                                <FaCloudUploadAlt className="text-4xl mx-auto mb-3" />
                                <p className="font-semibold">Click to change thumbnail</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="image_uploads"
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                          >
                            <div className="text-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300">
                                <FaImage className="text-3xl text-purple-600 dark:text-purple-400" />
                              </div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Upload Thumbnail
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                JPG, PNG or JPEG (Max: 5MB)
                              </p>
                              <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-300">
                                <AiOutlineUpload />
                                Choose Image
                              </div>
                            </div>
                          </label>
                        )}
                        <input
                          className="hidden"
                          type="file"
                          id="image_uploads"
                          accept=".jpg, .jpeg, .png"
                          name="image_uploads"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                    {userInput.previewImage && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <AiOutlineCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">Thumbnail uploaded successfully!</p>
                            <p className="text-sm text-green-600 dark:text-green-400">Your course thumbnail looks perfect</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Course Details */}
                <div className="space-y-8">
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-2xl mb-4">
                      <FaBook className="text-2xl text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-800 dark:text-white">Course Information</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Course Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Provide comprehensive course information
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Course Title */}
                    <div className="space-y-2 xs:space-y-3">
                      <label className="block text-base xs:text-lg font-semibold text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-2">
                          <FaBook className="text-blue-500 text-sm xs:text-base" />
                          Course Title *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={userInput.title}
                        onChange={handleUserInput}
                        placeholder="Enter an engaging course title..."
                        className="w-full px-4 xs:px-6 py-3 xs:py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg xs:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm xs:text-lg"
                      />
                    </div>

                    {/* Instructor */}
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-2">
                          <FaChalkboardTeacher className="text-emerald-500" />
                          Instructor Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="createdBy"
                        value={userInput.createdBy}
                        onChange={handleUserInput}
                        placeholder="Enter instructor name..."
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-2">
                          <AiOutlineTag className="text-purple-500" />
                          Course Category *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={userInput.category}
                        onChange={handleUserInput}
                        placeholder="e.g., Web Development, Data Science, Design..."
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-2">
                          <AiOutlineTag className="text-green-500" />
                          Course Price (₹) *
                        </span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={userInput.price}
                        onChange={handleUserInput}
                        placeholder="Enter course price (e.g., 299)..."
                        min="0"
                        step="1"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:focus:border-green-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-2">
                          <AiOutlineFileText className="text-indigo-500" />
                          Course Description *
                        </span>
                      </label>
                      <textarea
                        name="description"
                        value={userInput.description}
                        onChange={handleUserInput}
                        rows={6}
                        placeholder="Describe what students will learn, course benefits, and key outcomes..."
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg resize-none"
                      />
                    </div>
                  </div>

                  {/* Completion Status */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <HiOutlineSparkles className="text-yellow-500" />
                      Completion Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.thumbnail ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        <BsImageFill className="text-lg" />
                        <span className="font-medium">Thumbnail</span>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.title ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        <FaBook className="text-lg" />
                        <span className="font-medium">Title</span>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.createdBy ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        <FaChalkboardTeacher className="text-lg" />
                        <span className="font-medium">Instructor</span>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.category ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        <AiOutlineTag className="text-lg" />
                        <span className="font-medium">Category</span>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.description ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        <AiOutlineFileText className="text-lg" />
                        <span className="font-medium">Description</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="px-4 xs:px-6 sm:px-8 lg:px-12 py-6 xs:py-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-4 xs:gap-6">
                <div className="space-y-1 xs:space-y-2">
                  <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <FaCrown className="text-yellow-500" />
                    Create your premium course and start teaching today
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All fields marked with * are required
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isCreatingCourse || !userInput.title || !userInput.description || !userInput.category || !userInput.createdBy || !userInput.thumbnail || !userInput.price}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-2 xs:gap-3 px-6 xs:px-8 py-3 xs:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg xs:rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm xs:text-lg min-w-[200px]"
                >
                  {isCreatingCourse ? (
                    <>
                      <FaSpinner className="animate-spin text-xl" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <AiOutlineCheckCircle className="text-xl" />
                      Create Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
