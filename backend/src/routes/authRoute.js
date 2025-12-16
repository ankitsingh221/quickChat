import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes with stricter auth limiter
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

export default router;
