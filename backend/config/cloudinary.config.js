import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Cloudinary upload result
 */
export async function uploadVideoToCloudinary(filePath, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'Learning-Management-System/lectures',
      resource_type: "video",
      quality: "auto",
      format: "mp4",
      transformation: [
        { quality: "auto:low" },
        { format: "mp4" }
      ],
      ...options
    });
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} - Deletion result
 */
export async function deleteVideoFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video"
    });
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default cloudinary;