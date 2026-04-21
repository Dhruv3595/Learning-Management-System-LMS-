const errorMiddleware = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Something went wrong";

    // Handle multer file size limit error
    if (error.code === 'LIMIT_FILE_SIZE') {
        error.statusCode = 413;
        error.message = 'File too large. Maximum file size is 500MB.';
    }

    // Handle multer file count limit error
    if (error.code === 'LIMIT_FILE_COUNT') {
        error.statusCode = 413;
        error.message = 'Too many files. Maximum allowed files is 10.';
    }

    // Handle multer field size limit error
    if (error.code === 'LIMIT_FIELD_SIZE') {
        error.statusCode = 413;
        error.message = 'Field size too large. Maximum field size is 25MB.';
    }

    // Handle connection timeout errors
    if (error.code === 'ECONNRESET' || error.type === 'request.timeout') {
        error.statusCode = 408;
        error.message = 'Request timeout. Please try uploading a smaller file or check your internet connection.';
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
};

export default errorMiddleware;