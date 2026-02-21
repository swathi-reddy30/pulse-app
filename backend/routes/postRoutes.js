import express from "express";
import {
  createPost, deletePost, likePost,
  getAllPosts, addComment, deleteComment, getPostById
} from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";
import { uploadPostImage } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", protect, getAllPosts);
router.get("/:id", protect, getPostById);
router.post("/", protect, uploadPostImage.single("image"), createPost);
router.delete("/:id", protect, deletePost);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect, addComment);
router.delete("/comment/:postId/:commentId", protect, deleteComment);

export default router;