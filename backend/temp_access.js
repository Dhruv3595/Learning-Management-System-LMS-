// Check if user has access to course lectures (based on purchase/subscription)
export const checkCourseAccess = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { _id } = req.user;

        // Check if user has a valid order for this course or subscription
        const hasAccess = await Order.findOne({
            userId: _id,
            $or: [
                { 
                    courseIds: courseId, 
                    paymentStatus: 'paid',
                    orderStatus: { $in: ['completed', 'processing'] }
                },
                { 
                    orderType: 'subscription', 
                    paymentStatus: 'paid',
                    orderStatus: { $in: ['completed', 'processing'] }
                }
            ]
        });

        if (!hasAccess) {
            return next(new AppError("You don't have access to this course. Please purchase the course or subscribe.", 403));
        }

        res.status(200).json({
            success: true,
            message: "Course access verified",
            hasAccess: true,
            orderId: hasAccess._id,
            orderType: hasAccess.orderType
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};