import PropTypes from "prop-types";
import React, { useState } from "react";
import { FaBookOpen, FaClock, FaPlay, FaStar,FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ data }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    navigate("/courses/description/", { state: { ...data } });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = '/placeholder-course.jpg';
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl xs:rounded-2xl border border-gray-200 bg-white shadow-lg will-change-auto hover:will-change-transform transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 w-full max-w-sm mx-auto xs:max-w-none"
      onClick={handleCardClick}
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {/* Thumbnail Section with Fixed Aspect Ratio */}
      <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700" style={{ aspectRatio: '16/9' }}>
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
        )}
        
        <img
          className={`w-full h-full object-cover transition-all duration-200 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={data?.thumbnail ? `http://localhost:5001${data.thumbnail}` : '/placeholder-course.jpg'}
          alt={data?.title || "Course thumbnail"}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ transform: 'translate3d(0,0,0)' }}
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-4 backdrop-blur-sm transform scale-75 transition-transform duration-200 group-hover:scale-100">
            <FaPlay className="text-blue-600 text-xl ml-1" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 xs:top-4 left-2 xs:left-4 z-10">
          <span className="px-2 xs:px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs xs:text-sm font-semibold rounded-full shadow-lg">
            {data?.category}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-2 xs:top-4 right-2 xs:right-4 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <FaStar className="text-xs" />
            <span>₹{data?.price}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 xs:p-4 sm:p-6 relative">
        {/* Title */}
        <h3 className="mb-2 xs:mb-3 line-clamp-2 h-12 xs:h-14 text-sm xs:text-lg sm:text-xl font-bold leading-tight text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {data?.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-xs xs:text-sm mb-3 xs:mb-4 line-clamp-2 leading-relaxed">
          {data?.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-4 mb-3 xs:mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaBookOpen className="text-blue-600 dark:text-blue-400 text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lectures</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{data?.numberOfLectures}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaClock className="text-green-600 dark:text-green-400 text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">8h 30m</p>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-xs" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Instructor</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{data?.createdBy}</p>
          </div>
        </div>

        {/* Rating and Price Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-sm" />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.8)</span>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{data?.price}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CourseCard.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    createdBy: PropTypes.string,
    numberOfLectures: PropTypes.number,
    thumbnail: PropTypes.string,
    price: PropTypes.number,
    video: PropTypes.shape({
      public_id: PropTypes.string,
      secure_url: PropTypes.string,
    }),
  }).isRequired,
};
