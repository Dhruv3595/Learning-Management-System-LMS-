/**
 * Utility functions for video handling in the LMS
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string} - Video ID or empty string if invalid
 */
export function extractYouTubeVideoId(url) {
  if (!url) return '';
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : '';
}

/**
 * Validate if a URL is a valid YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
  return youtubeRegex.test(url);
}

/**
 * Generate YouTube embed URL from any YouTube URL
 * @param {string} url - YouTube URL
 * @param {object} options - Embed options
 * @returns {string} - YouTube embed URL
 */
export function generateYouTubeEmbedUrl(url, options = {}) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return '';
  
  const {
    autoplay = 0,
    mute = 0,
    controls = 1,
    modestbranding = 1,
    rel = 0,
    showinfo = 0
  } = options;
  
  const params = new URLSearchParams({
    autoplay,
    mute,
    controls,
    modestbranding,
    rel,
    showinfo
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Get YouTube video thumbnail URL
 * @param {string} url - YouTube URL
 * @param {string} quality - Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} - Thumbnail URL
 */
export function getYouTubeThumbnail(url, quality = 'hqdefault') {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return '';
  
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Validate video file type and size
 * @param {File} file - Video file
 * @param {number} maxSizeMB - Maximum size in MB (default: 500MB)
 * @returns {object} - Validation result with isValid and error message
 */
export function validateVideoFile(file, maxSizeMB = 500) {
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 'video/wmv', 'video/flv'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
/**
 * Get the backend base URL for serving static files
 * @returns {string} - Backend base URL without /api/v1
 */
export function getBackendBaseUrl() {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5001/api/v1';
  // Remove /api/v1 from the end to get the base URL
  return apiUrl.replace('/api/v1', '');
}

/**
 * Construct full URL for uploaded video files
 * @param {string} relativePath - Relative path from backend uploads directory
 * @returns {string} - Full URL to access the file
 */
export function getVideoUrl(relativePath) {
  if (!relativePath) return '';
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // Convert Windows backslashes to forward slashes and construct full URL
  const normalizedPath = relativePath.replace(/\\/g, '/');
  return `${getBackendBaseUrl()}/${normalizedPath}`;
}