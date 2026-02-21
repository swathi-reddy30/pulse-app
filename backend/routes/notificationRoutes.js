import express from "express";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate({ path: "sender", model: User, select: "username profilePic" })
      .populate({ path: "post", select: "content" })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Notification error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put("/read", protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { read: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;