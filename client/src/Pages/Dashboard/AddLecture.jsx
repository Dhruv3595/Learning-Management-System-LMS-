import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { 
  AiOutlineArrowLeft, 
  AiOutlineCheckCircle, 
  AiOutlinePlayCircle,
  AiOutlineUpload,
  AiOutlineVideoCamera} from "react-icons/ai";
import { 
  FaBook,
  FaCloudUploadAlt, 
  FaGraduationCap, 
  FaSpinner,
  FaVideo} from "react-icons/fa";
import { HiOutlineAcademicCap,HiOutlineSparkles } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import AdminLayout from "../../Layout/AdminLayout";
import { addCourseLecture } from "../../Redux/Slices/LectureSlice";
import { isValidYouTubeUrl, validateVideoFile } from "../../utils/videoUtils";

export default function AddLecture() {
  const courseDetails = useLocation().state;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const [userInput, setUserInput] = useState({
    id: courseDetails?._id,
    lecture: undefined,
    title: "",
    description: "",
    videoSrc: "",
    youtubeUrl: "",
    videoInputType: "upload", // "upload" or "youtube"
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }

  function handleVideo(e) {
    const video = e.target.files[0];
    if (video) {
      // Validate video file
      const validation = validateVideoFile(video);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      const source = window.URL.createObjectURL(video);
      setUserInput({
        ...userInput,
        lecture: video,
        videoSrc: source,
        videoInputType: "upload",
      });
      toast.success(`Video selected: ${video.name}`);
    }
  }

  function handleYouTubeUrlChange(e) {
    const url = e.target.value;
    setUserInput({
      ...userInput,
      youtubeUrl: url,
      videoInputType: url ? "youtube" : "upload",
    });
  }

  function handleVideoInputTypeChange(type) {
    setUserInput({
      ...userInput,
      videoInputType: type,
      // Clear the other input when switching
      ...(type === "youtube" ? { lecture: undefined, videoSrc: "" } : { youtubeUrl: "" }),
    });
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (!userInput.title || !userInput.description) {
      toast.error("Title and description are mandatory");
      return;
    }

    // Check if at least one video source is provided
    if (!userInput.youtubeUrl && !userInput.lecture) {
      toast.error("Please provide either a YouTube URL or upload a video file");
      return;
    }

    // Validate YouTube URL if provided
    if (userInput.youtubeUrl && !isValidYouTubeUrl(userInput.youtubeUrl)) {
      toast.error("Please provide a valid YouTube URL");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    
    // Add YouTube URL if provided (takes priority)
    if (userInput.youtubeUrl) {
      formData.append("youtubeUrl", userInput.youtubeUrl);
    }
    
    // Add video file if provided and no YouTube URL
    if (userInput.lecture && !userInput.youtubeUrl) {
      formData.append("lecture", userInput.lecture);
    }

    const data = { formData, id: userInput.id };    const response = await dispatch(addCourseLecture(data));
    if (response?.payload?.success) {
      navigate(-1);
      setUserInput({
        id: courseDetails?._id,
        lecture: undefined,
        title: "",
        description: "",
        videoSrc: "",
        youtubeUrl: "",
        videoInputType: "upload",
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!courseDetails) navigate("/courses");
  }, [courseDetails, navigate]);

  return (
    <AdminLayout>
      {/* Premium Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <AiOutlineArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back</span>
              </button>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-2">
                  <HiOutlineAcademicCap className="text-yellow-400" />
                  <span className="text-sm font-medium">Course Content</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Add New Lecture
                </h1>
                {courseDetails && (
                  <p className="text-blue-100 mt-2 text-lg">
                    for &ldquo;{courseDetails.title}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <form
          onSubmit={onFormSubmit}
          autoComplete="off"
          noValidate
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* Form Content Container */}
          <div className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Video Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-2xl">
                    <FaVideo className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video Content</h2>
                    <p className="text-gray-600 dark:text-gray-300">Choose your video source</p>
                  </div>
                </div>

                {/* Video Input Type Selector */}
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => handleVideoInputTypeChange("upload")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                      userInput.videoInputType === "upload"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AiOutlineUpload className="text-xl" />
                      <div className="text-left">
                        <p className="font-semibold">Upload Video</p>
                        <p className="text-sm opacity-75">MP4, MOV, AVI files</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleVideoInputTypeChange("youtube")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                      userInput.videoInputType === "youtube"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AiOutlinePlayCircle className="text-xl" />
                      <div className="text-left">
                        <p className="font-semibold">YouTube URL</p>
                        <p className="text-sm opacity-75">Paste YouTube link</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Conditional Video Input */}
                {userInput.videoInputType === "youtube" ? (
                  /* YouTube URL Input */
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-2 mb-3">
                        <AiOutlinePlayCircle className="text-red-500" />
                        YouTube Video URL
                      </span>
                    </label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      value={userInput.youtubeUrl}
                      onChange={handleYouTubeUrlChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                    />
                    
                    {userInput.youtubeUrl && (
                      <div className={`p-4 rounded-xl border ${
                        isValidYouTubeUrl(userInput.youtubeUrl)
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      }`}>
                        <div className="flex items-center gap-3">
                          {isValidYouTubeUrl(userInput.youtubeUrl) ? (
                            <>
                              <AiOutlineCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                              <div>
                                <p className="font-semibold text-green-800 dark:text-green-200">Valid YouTube URL</p>
                                <p className="text-sm text-green-600 dark:text-green-400">Ready to add lecture</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AiOutlineVideoCamera className="text-red-600 dark:text-red-400 text-xl" />
                              <div>
                                <p className="font-semibold text-red-800 dark:text-red-200">Invalid YouTube URL</p>
                                <p className="text-sm text-red-600 dark:text-red-400">Please check the URL format</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Video File Upload */
                  <div className="relative">
                    <div className="group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl h-80 flex flex-col justify-center items-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20">
                      {userInput.videoSrc ? (
                        <div className="relative w-full h-full rounded-3xl overflow-hidden">
                          <video
                            muted
                            src={userInput.videoSrc}
                            controls
                            controlsList="nodownload nofullscreen"
                            disablePictureInPicture
                            className="w-full h-full object-cover rounded-3xl"
                            onClick={(e) => {
                              e.preventDefault();
                              videoRef.current.click();
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-3xl">
                            <div className="text-center text-white">
                              <FaCloudUploadAlt className="text-4xl mx-auto mb-3" />
                              <p className="font-semibold">Click to change video</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="lecture"
                          className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                        >
                          <div className="text-center group-hover:scale-110 transition-transform duration-300">
                            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300">
                              <FaCloudUploadAlt className="text-3xl text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              Upload Video
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              Drag and drop your video file here
                            </p>
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors duration-300">
                              <AiOutlineUpload />
                              Choose File
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                              Supports: MP4, MOV, AVI, MKV, WEBM (Max: 500MB)
                            </p>
                          </div>
                        </label>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        id="lecture"
                        ref={videoRef}
                        name="lecture"
                        onChange={handleVideo}
                        accept="video/mp4, video/mov, video/avi, video/mkv, video/webm, video/*"
                      />
                    </div>
                  </div>
                )}

                {/* Video Preview Info */}
                {(userInput.videoSrc || (userInput.youtubeUrl && isValidYouTubeUrl(userInput.youtubeUrl))) && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <AiOutlineCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          {userInput.videoInputType === "youtube" ? "YouTube URL Ready" : "Video Ready"}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {userInput.videoInputType === "youtube" 
                            ? "YouTube video will be embedded in the lecture"
                            : "Your video has been selected successfully"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-2xl">
                    <FaBook className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lecture Details</h2>
                    <p className="text-gray-600 dark:text-gray-300">Add title and description</p>
                  </div>
                </div>

                {/* Enhanced Input Fields */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <span className="flex items-center gap-2">
                        <HiOutlineSparkles className="text-yellow-500" />
                        Lecture Title
                      </span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={userInput.title}
                      onChange={handleInputChange}
                      placeholder="Enter an engaging lecture title..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <span className="flex items-center gap-2">
                        <FaGraduationCap className="text-purple-500" />
                        Lecture Description
                      </span>
                    </label>
                    <textarea
                      name="description"
                      value={userInput.description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Describe what students will learn in this lecture..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg resize-none"
                    />
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                    (userInput.lecture || (userInput.youtubeUrl && isValidYouTubeUrl(userInput.youtubeUrl))) 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    <AiOutlineVideoCamera className="text-lg" />
                    <span className="text-sm font-medium">Video</span>
                  </div>
                  <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.title ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    <HiOutlineSparkles className="text-lg" />
                    <span className="text-sm font-medium">Title</span>
                  </div>
                  <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${userInput.description ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    <FaBook className="text-lg" />
                    <span className="text-sm font-medium">Description</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="px-8 lg:px-12 py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <AiOutlinePlayCircle className="text-blue-500" />
                  Ready to publish your lecture?
                </span>
              </div>
              <button
                type="submit"
                disabled={isLoading || !userInput.lecture || !userInput.title || !userInput.description}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Publishing Lecture...
                  </>
                ) : (
                  <>
                    <AiOutlineCheckCircle className="text-xl" />
                    Publish Lecture
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
