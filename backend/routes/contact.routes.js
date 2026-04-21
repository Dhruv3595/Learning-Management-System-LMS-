import { Router } from "express";
const router = Router();

import { contactUs } from "../controllers/contact.controller.js";

// Contact form submission route
router.post("/", contactUs);

export default router; 