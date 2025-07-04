import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getPosts, getPost, getUserPosts , createPost, likePost, deletePost} from "../controllers/post.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// public routes
router.get("/",getPosts)
router.get("/:postId", getPost)
router.get("/user/:username", getUserPosts)

// protected routes
router.post("/", protectRoute, upload.single("image"), createPost)
router.post("/:postId/like", protectRoute, likePost)
router.delete("/:postId", protectRoute, deletePost)



  
export default router;