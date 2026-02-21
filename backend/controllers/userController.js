import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io, connectedUsers } from "../server.js";

export const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: "You can't follow yourself" });

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ message: "User not found" });

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);

      // send follow notification
      const notification = new Notification({
        recipient: req.params.id,
        sender: req.user.id,
        type: "follow",
      });
      await notification.save();

      const recipientSocketId = connectedUsers[req.params.id];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", {
          type: "follow",
          sender: req.user.id,
        });
      }
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: isFollowing ? "Unfollowed" : "Followed",
      following: currentUser.following.length,
      followers: userToFollow.followers.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const Post = (await import("../models/Post.js")).default;
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "username profilePic")  // make sure this line exists
      .sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { username: { $regex: req.query.search, $options: "i" } }
      : {};
    const users = await User.find(keyword).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio } = req.body;
    const profilePic = req.file ? req.file.path : undefined;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic) updateData.profilePic = profilePic;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

