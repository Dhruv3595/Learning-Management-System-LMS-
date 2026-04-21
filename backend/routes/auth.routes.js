import { Router } from "express";
import { googleAuth } from "../controllers/auth.controller.js";

const router = Router();

// Google OAuth route
router.post('/google', googleAuth);

export default router;