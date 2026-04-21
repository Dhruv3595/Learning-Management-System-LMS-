import courseModel from '../models/course.model.js';
import AppError from '../utils/error.utils.js';
import fs from 'fs/promises';
import path from 'path';

// get all courses
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await courseModel.find({}).select('-lectures');

        // Normalize thumbnail paths for consistent URL format
        const normalizedCourses = courses.map(course => {
            const courseObj = course.toObject();
            if (courseObj.thumbnail) {
                // Convert backslashes to forward slashes and ensure /uploads/ prefix
                let normalizedPath = courseObj.thumbnail.replace(/\\/g, '/');
                if (!normalizedPath.startsWith('/uploads/')) {
                    normalizedPath = '/uploads/' + normalizedPath.replace(/^uploads\/?/, '');
                }
                courseObj.thumbnail = normalizedPath;
            }
            
            // Log price for debugging
            console.log(`Course: ${courseObj.title}, Price: ${courseObj.price} (Type: ${typeof courseObj.price})`);
            
            return courseObj;
        });

        res.status(200).json({
            success: true,
            message: 'All courses',
            courses: normalizedCourses
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// get specific course
const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await courseModel.findById(id)
        if (!course) {
            return next(new AppError('course not found', 500));
        }

        // Normalize thumbnail path for consistent URL format
        const courseObj = course.toObject();
        if (courseObj.thumbnail) {
            // Convert backslashes to forward slashes and ensure /uploads/ prefix
            let normalizedPath = courseObj.thumbnail.replace(/\\/g, '/');
            if (!normalizedPath.startsWith('/uploads/')) {
                normalizedPath = '/uploads/' + normalizedPath.replace(/^uploads\/?/, '');
            }
            courseObj.thumbnail = normalizedPath;
        }

        res.status(200).json({
            success: true,
            message: 'course',
            course: courseObj
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// create course
const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, createdBy, price } = req.body;

        if (!title || !description || !category || !createdBy || !price) {
            return next(new AppError('All fields are required', 400));
        }

        // Ensure price is a valid integer
        const parsedPrice = parseInt(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return next(new AppError('Price must be a valid positive number', 400));
        }

        console.log('Creating course with price:', parsedPrice, 'Original price input:', price);

        const course = new courseModel({
            title,
            description,
            category,
            createdBy,
            price: parsedPrice, // Store as integer
        });

        if (req.file) {
            // Normalize the path to use forward slashes and ensure it starts with /uploads/
            let thumbnailPath = req.file.path.replace(/\\/g, '/');
            if (!thumbnailPath.startsWith('/uploads/')) {
                thumbnailPath = '/uploads/' + path.basename(thumbnailPath);
            }
            course.thumbnail = thumbnailPath;
            console.log('Course thumbnail saved:', thumbnailPath);
        }

        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course successfully created',
            course,
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// update course
const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await courseModel.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 404));
        }

        const { title, description, category, createdBy, price } = req.body;
        if (title) course.title = title;
        if (description) course.description = description;
        if (category) course.category = category;
        if (createdBy) course.createdBy = createdBy;
        if (price) {
            const parsedPrice = parseInt(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return next(new AppError('Price must be a valid positive number', 400));
            }
            course.price = parsedPrice;
        }

        if (req.file) {
            if (course.thumbnail) {
                try {
                    // Remove leading slash for file system operations
                    const oldPath = course.thumbnail.startsWith('/') ? course.thumbnail.slice(1) : course.thumbnail;
                    await fs.unlink(oldPath);
                    console.log('Old thumbnail deleted:', oldPath);
                } catch (error) {
                    console.error('Failed to delete old thumbnail:', error);
                }
            }
            // Normalize the path to use forward slashes and ensure it starts with /uploads/
            let thumbnailPath = req.file.path.replace(/\\/g, '/');
            if (!thumbnailPath.startsWith('/uploads/')) {
                thumbnailPath = '/uploads/' + path.basename(thumbnailPath);
            }
            course.thumbnail = thumbnailPath;
            console.log('Course thumbnail updated:', thumbnailPath);
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// remove course
const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await courseModel.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 404));
        }

        // Delete thumbnail file if exists
        if (course.thumbnail) {
            try {
                // Remove leading slash for file system operations
                const filePath = course.thumbnail.startsWith('/') ? course.thumbnail.slice(1) : course.thumbnail;
                await fs.unlink(filePath);
                console.log('Thumbnail file deleted:', filePath);
            } catch (error) {
                console.error('Failed to delete thumbnail file:', error);
            }
        }

        await courseModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// add lecture to course by id
const addLectureToCourseById = async (req, res, next) => {
    try {
        const { title, description, youtubeUrl } = req.body;
        const { id } = req.params;

        if (!title || !description) {
            return next(new AppError('Title and description are required', 400));
        }

        // Validate that at least one video source is provided
        if (!youtubeUrl && !req.file) {
            return next(new AppError('Either YouTube URL or video file must be provided', 400));
        }

        const course = await courseModel.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 404));
        }

        const lectureData = {
            title,
            description,
            videoType: '',
            videoUrl: '',
            lecture: {}
        };

        // YouTube URL validation function
        const isValidYouTubeUrl = (url) => {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
            return youtubeRegex.test(url);
        };

        // Handle video source based on priority (YouTube URL > File Upload)
        if (youtubeUrl) {
            console.log('Processing YouTube URL:', youtubeUrl);
            if (!isValidYouTubeUrl(youtubeUrl)) {
                console.log('❌ Invalid YouTube URL format');
                return next(new AppError('Invalid YouTube URL format', 400));
            }
            console.log('✅ YouTube URL is valid');
            
            lectureData.videoType = 'youtube';
            lectureData.videoUrl = youtubeUrl;
            console.log('Lecture created with YouTube URL:', youtubeUrl);
            
        } else if (req.file) {
            console.log('Processing uploaded file:', req.file.originalname);
            console.log('File size:', (req.file.size / (1024 * 1024)).toFixed(2), 'MB');
            
            // Handle video file upload with improved error handling
            try {
                // Validate file size (additional check beyond multer)
                const maxSizeBytes = 500 * 1024 * 1024; // 500MB
                if (req.file.size > maxSizeBytes) {
                    return next(new AppError(`File too large. Maximum size is 500MB. Your file is ${(req.file.size / (1024 * 1024)).toFixed(2)}MB`, 413));
                }
                
                lectureData.videoType = 'upload';
                // Normalize the path to use forward slashes
                const normalizedPath = req.file.path.replace(/\\/g, '/');
                lectureData.videoUrl = normalizedPath;
                lectureData.lecture = {
                    secure_url: normalizedPath,
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    size: req.file.size
                };
                console.log('✅ Lecture video uploaded successfully:', normalizedPath);
                
            } catch (fileError) {
                console.error('File processing error:', fileError);
                return next(new AppError('Failed to process uploaded video file', 500));
            }
            
            // TODO: Uncomment and configure Cloudinary for production
            /*
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'Learning-Management-System/lectures',
                    resource_type: "video",
                    quality: "auto",
                    format: "mp4"
                });
                
                if (result) {
                    lectureData.videoUrl = result.secure_url;
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;
                }

                // Remove local file after uploading to Cloudinary
                fs.rmSync(req.file.path);
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                return next(new AppError('Failed to upload video to cloud storage', 500));
            }
            */
        }

        course.lectures.push(lectureData);
        course.numberOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture added successfully',
            lecture: lectureData
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// delete lecture by course id and lecture id
const deleteCourseLecture = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.query;

        const course = await courseModel.findById(courseId);

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const lectureIndex = course.lectures.findIndex(lecture => lecture._id.toString() === lectureId);

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found in the course', 404));
        }

        // Delete lecture video file if exists
        const lecture = course.lectures[lectureIndex];
        if (lecture.lecture && lecture.lecture.secure_url) {
            try {
                await fs.unlink(lecture.lecture.secure_url);
                console.log('Lecture video file deleted:', lecture.lecture.secure_url);
            } catch (error) {
                console.error('Failed to delete lecture video file:', error);
            }
        }

        course.lectures.splice(lectureIndex, 1);
        course.numberOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};


// update lecture by course id and lecture id
const updateCourseLecture = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.query;
        const { title, description } = req.body;

        if (!title || !description) {
            return next(new AppError('All fields are required', 400));
        }

        const course = await courseModel.findById(courseId);

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const lectureIndex = course.lectures.findIndex(lecture => lecture._id.toString() === lectureId);

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found in the course', 404));
        }

        const updatedLectureData = {
            title,
            description,
            lecture: {
                secure_url: course.lectures[lectureIndex].lecture.secure_url
            }
        };

        // Handle lecture video update
        if (req.file) {
            try {
                // Delete old lecture video file if exists
                if (course.lectures[lectureIndex].lecture.secure_url) {
                    await fs.unlink(course.lectures[lectureIndex].lecture.secure_url);
                }

                // Save new lecture video
                updatedLectureData.lecture = {
                    secure_url: req.file.path
                };
                console.log('Lecture video updated successfully:', req.file.path);
            } catch (uploadError) {
                console.error('Lecture video update failed:', uploadError);
                return next(new AppError('Failed to update lecture video', 500));
            }
        }

        // Update the lecture details
        course.lectures[lectureIndex] = updatedLectureData;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture updated successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};


export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    deleteCourseLecture,
    updateCourseLecture
}