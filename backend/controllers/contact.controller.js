import Contact from "../models/contact.model.js";
import AppError from "../utils/error.utils.js";

const contactUs = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return next(new AppError("All fields are required", 400));
        }

        const contact = await Contact.create({
            name,
            email,
            message,
        });

        if (!contact) {
            return next(new AppError("Message could not be sent, please try again", 500));
        }

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            contact,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export { contactUs }; 