import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { io, connectedUsers } from "../server.js";

const sendNotification = async ({ recipient, sender, type, post = null }) => {
  // don't notify yourself
  if (recipient.toString() === sender) return;

  const notification = new Notification({ recipient, sender, type, post });
  await notification.save();

  // if recipient is online, send real-time notification
  const recipientSocketId = connectedUsers[recipient.toString()];
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("newNotification", {
      type,
      sender,
      post,
    });
  }
};

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const content = req.body.content || "";
    const image = req.file ? req.file.path : "";

    if (!content && !image)
      return res.status(400).json({ message: "Post must have text or image" });

    const newPost = new Post({ author: req.user.id, content, image });
    await newPost.save();

    const populated = await Post.findById(newPost._id)
      .populate("author", "username profilePic");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "You can only delete your own posts" });
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIKE / UNLIKE POST
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      // send notification to post author
      await sendNotification({
        recipient: post.author,
        sender: req.user.id,
        type: "like",
        post: post._id,
      });
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE POST
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePic")
      .populate("comments.user", "username profilePic");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: req.user.id, text: req.body.text };
    post.comments.push(comment);
    await post.save();

    // send notification to post author
    await sendNotification({
      recipient: post.author,
      sender: req.user.id,
      type: "comment",
      post: post._id,
    });

    const updatedPost = await Post.findById(req.params.id)
      .populate("comments.user", "username profilePic");
    res.status(200).json(updatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "You can only delete your own comments" });

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await post.save();
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};