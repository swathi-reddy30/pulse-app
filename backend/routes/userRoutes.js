import express from "express";
import { followUser, getUserProfile, searchUsers, updateProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import { uploadProfileImage } from "../config/cloudinary.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserProfile);
router.put("/follow/:id", protect, followUser);
router.put("/profile/update", protect, uploadProfileImage.single("profilePic"), updateProfile);

export default router;