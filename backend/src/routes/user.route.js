import express from "express";
import { getUserProfile, updateProfile, syncUser , getCurrentUser , followUser } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
// public routes
router.get("/profile/:username", getUserProfile)

// protected routes
router.post("/sync" , protectRoute, syncUser);
router.put("/profile", protectRoute, updateProfile)
router.get("/me", protectRoute, getCurrentUser)
router.post("/follow/:userId", protectRoute, followUser)

export default router;