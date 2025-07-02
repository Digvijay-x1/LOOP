import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { getComments, createComment, deleteComment } from "../controllers/comment.controller";


const router = express.Router();

// public routes
router.get("/post/:postId", getComments)


// protected routes

router.post("/post/:postId", protectRoute, createComment);
router.delete("/:commentId", protectRoute, deleteComment);

export default router;