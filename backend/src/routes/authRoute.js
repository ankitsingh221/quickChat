import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import protectRoute from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes with stricter auth limiter
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

// Protected routes
router.post("/logout", protectRoute, logout);
router.get("/me", protectRoute, getMe);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
