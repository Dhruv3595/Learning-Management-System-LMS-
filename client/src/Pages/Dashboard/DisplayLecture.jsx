import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AiOutlineArrowLeft,
  AiOutlineClockCircle,
  AiOutlineEye,
  AiOutlineVideoCamera
} from "react-icons/ai";
import { BsCollectionPlay,BsPlayFill, BsTrash } from "react-icons/bs";
import {
  FaBook,
  FaPlus,
  FaVideo} from "react-icons/fa";
import { 
  HiOutlineAcademicCap,
  HiOutlineBookOpen 
} from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation,useNavigate } from "react-router-dom";

import {
  deleteCourseLecture,
  getCourseLectures,
} from "../../Redux/Slices/LectureSlice";
import { extractYouTubeVideoId, getVideoUrl } from "../../utils/videoUtils";

export default function DisplayLecture() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { lectures } = useSelector((state) => state.lecture);
  const { role } = useSelector((state) => state.auth);

  const [currentVideo, setCurrentVideo] = useState(0);

  async function onLectureDelete(courseId, lectureId) {
    await dispatch(
      deleteCourseLecture({ courseId: courseId, lectureId: lectureId })
    );
    await dispatch(getCourseLectures(courseId));
  }

  useEffect(() => {
    if (!state) navigate("/courses");
    dispatch(getCourseLectures(state._id));
  }, [state, navigate, dispatch]);

  return (
    <>
      {/* Premium Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative px-4 xs:px-6 py-6 xs:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 xs:gap-4 mb-4 xs:mb-6">
              <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 px-3 xs:px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm xs:text-base"
              >
                <AiOutlineArrowLeft className="text-base xs:text-lg group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium hidden xs:inline">Back to Courses</span>
                <span className="font-medium xs:hidden">Back</span>
              </button>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1 xs:py-2 bg-white/10 backdrop-blur-sm rounded-full mb-3 xs:mb-4">
                <HiOutlineAcademicCap className="text-yellow-400 text-sm xs:text-base" />
                <span className="text-xs xs:text-sm font-medium">Course Content</span>
              </div>
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-bold mb-3 xs:mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent px-4 xs:px-0">
                {state?.title}
              </h1>
              <p className="text-sm xs:text-lg text-blue-100">
                <BsCollectionPlay className="inline mr-2" />
                {lectures?.length || 0} Lectures Available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 xs:px-6 -mt-6 xs:-mt-8 relative z-10 pb-12 xs:pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl xs:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {lectures && lectures.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-0 min-h-[60vh] xs:min-h-[70vh] lg:min-h-[80vh]">
              {/* Video Player Section */}
              <div className="lg:col-span-2 p-4 xs:p-6 sm:p-8 border-r-0 lg:border-r border-gray-200 dark:border-gray-700">
                <div className="space-y-4 xs:space-y-6">
                  {/* Video Container */}
                  <div className="relative">
                    <div className="aspect-video bg-black rounded-2xl xs:rounded-3xl overflow-hidden shadow-xl xs:shadow-2xl">
                      {lectures?.[currentVideo] ? (
                        lectures[currentVideo].videoType === "youtube" ? (
                          /* YouTube Video Player */
                          <div className="w-full h-full">
                            {lectures[currentVideo].videoUrl ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(lectures[currentVideo].videoUrl)}?rel=0&modestbranding=1`}
                                title={lectures[currentVideo].title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                <div className="text-center">
                                  <AiOutlineVideoCamera className="mx-auto text-6xl mb-4 opacity-50" />
                                  <p className="text-lg">YouTube URL not available</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : lectures[currentVideo].videoType === "upload" ? (
                          /* Uploaded Video Player */
                          <video
                            src={getVideoUrl(lectures[currentVideo].videoUrl) || getVideoUrl(lectures[currentVideo].lecture?.secure_url)}
                            disablePictureInPicture
                            disableRemotePlayback
                            controls
                            controlsList="nodownload"
                            className="w-full h-full object-contain"
                            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23000'/%3E%3Cg fill='%23fff' opacity='0.1'%3E%3Ccircle cx='400' cy='225' r='60'/%3E%3Cpolygon points='380,200 380,250 420,225'/%3E%3C/g%3E%3C/svg%3E"
                            onError={(e) => {
                              console.error('Video loading error:', e);
                              console.error('Video URL:', lectures[currentVideo].videoUrl || lectures[currentVideo].lecture?.secure_url);
                              console.error('Constructed URL:', getVideoUrl(lectures[currentVideo].videoUrl) || getVideoUrl(lectures[currentVideo].lecture?.secure_url));
                              console.error('Error details:', {
                                error: e.target.error,
                                networkState: e.target.networkState,
                                readyState: e.target.readyState,
                                currentSrc: e.target.currentSrc
                              });
                              toast.error('Failed to load video. Check console for details.');
                            }}
                            onLoadStart={() => {
                              console.log('Video loading started:', lectures[currentVideo].videoUrl || lectures[currentVideo].lecture?.secure_url);
                            }}
                            onCanPlay={() => {
                              console.log('Video can play successfully');
                            }}
                            onLoadedData={() => {
                              console.log('Video data loaded');
                            }}
                          />
                        ) : (
                          /* Legacy support for lectures without videoType */
                          lectures[currentVideo].lecture?.secure_url ? (
                            <video
                              src={getVideoUrl(lectures[currentVideo].lecture.secure_url)}
                              disablePictureInPicture
                              disableRemotePlayback
                              controls
                              controlsList="nodownload"
                              className="w-full h-full object-contain"
                              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23000'/%3E%3Cg fill='%23fff' opacity='0.1'%3E%3Ccircle cx='400' cy='225' r='60'/%3E%3Cpolygon points='380,200 380,250 420,225'/%3E%3C/g%3E%3C/svg%3E"
                              onError={(e) => {
                                console.error('Video loading error:', e);
                                console.error('Video URL:', lectures[currentVideo].lecture.secure_url);
                                toast.error('Failed to load video. Check console for details.');
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <div className="text-center">
                                <AiOutlineVideoCamera className="mx-auto text-6xl mb-4 opacity-50" />
                                <p className="text-lg">No video available for this lecture</p>
                                <p className="text-sm opacity-75 mt-2">Legacy lecture format</p>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <AiOutlineVideoCamera className="mx-auto text-6xl mb-4 opacity-50" />
                            <p className="text-lg">No lecture selected</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info Overlay */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                        <BsPlayFill className="text-green-400" />
                        Lecture {currentVideo + 1} of {lectures.length}
                      </div>
                    </div>
                  </div>

                  {/* Current Lecture Details */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-2xl">
                        <FaVideo className="text-2xl text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {lectures?.[currentVideo]?.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                          <span className="flex items-center gap-1">
                            <AiOutlineClockCircle />
                            Lecture {currentVideo + 1}
                          </span>
                          <span className="flex items-center gap-1">
                            <AiOutlineEye />
                            Educational Content
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        <HiOutlineBookOpen className="text-blue-500" />
                        Description
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {lectures?.[currentVideo]?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lectures Sidebar */}
              <div className="bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <div className="sticky top-0 z-10 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaBook className="text-blue-500" />
                      Course Content
                    </h3>
                    {role === "ADMIN" && (
                      <button
                        onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 text-sm"
                      >
                        <FaPlus className="text-xs" />
                        Add Lecture
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {lectures.length} lectures • Course progress
                  </div>
                </div>

                <div className="h-[calc(80vh-140px)] overflow-y-auto">
                  <div className="p-4 space-y-2">
                    {lectures.map((lecture, idx) => (
                      <div
                        key={lecture._id}
                        className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                          currentVideo === idx
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }`}
                        onClick={() => setCurrentVideo(idx)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentVideo === idx
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          }`}>
                            {currentVideo === idx ? (
                              <BsPlayFill className="text-lg" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold text-sm truncate ${
                                currentVideo === idx ? 'text-white' : 'text-gray-900 dark:text-white'
                              }`}>
                                {lecture.title}
                              </h4>
                              {/* Video Type Indicator */}
                              {lecture.videoType === "youtube" ? (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                  currentVideo === idx 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                }`}>
                                  <AiOutlineVideoCamera className="text-xs" />
                                  YT
                                </div>
                              ) : lecture.videoType === "upload" ? (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                  currentVideo === idx 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                                }`}>
                                  <FaVideo className="text-xs" />
                                  MP4
                                </div>
                              ) : null}
                            </div>
                            <p className={`text-xs truncate ${
                              currentVideo === idx ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {lecture.description}
                            </p>
                            {currentVideo === idx && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Now Playing
                              </div>
                            )}
                          </div>
                          {role === "ADMIN" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onLectureDelete(state?._id, lecture?._id);
                              }}
                              className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200 ${
                                currentVideo === idx
                                  ? 'hover:bg-white/20 text-white'
                                  : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400'
                              }`}
                              title="Delete Lecture"
                            >
                              <BsTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <AiOutlineVideoCamera className="text-6xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">No lectures available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                This course doesn&apos;t have any lectures yet. 
                {role === "ADMIN" && " Start by adding your first lecture."}
              </p>
              {role === "ADMIN" && (
                <button
                  onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <FaPlus />
                  Add First Lecture
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
