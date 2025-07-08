import express from "express";
import { getUserProfile, updateProfile, syncUser , getCurrentUser , followUser , getFollowers , getFollowing , searchUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
// public routes
router.get("/profile/:username", getUserProfile)

// protected routes
router.post("/sync" , protectRoute, syncUser);
router.put("/profile", protectRoute, updateProfile)
router.get("/me", protectRoute, getCurrentUser)
router.get("/search/:query", protectRoute, searchUsers)

router.post("/follow/:userId", protectRoute, followUser) // send friend request
router.get("/follower", protectRoute, getFollowers);
router.get("/following", protectRoute, getFollowing);


export default router;