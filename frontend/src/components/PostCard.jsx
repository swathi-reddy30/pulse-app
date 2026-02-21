import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post, onDelete, onLike }) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.likes.includes(user?.id));
  const [likesCount, setLikesCount] = useState(post.likes.length);

  const handleLike = async () => {
    try {
      const res = await axios.put(`/posts/like/${post._id}`);
      setLiked(!liked);
      setLikesCount(res.data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
  const confirmed = window.confirm("Are you sure you want to delete this post?");
  if (!confirmed) return;
  try {
    await axios.delete(`/posts/${post._id}`);
    onDelete(post._id);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
      {/* author */}
      <div className="flex items-center justify-between">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {post.author.profilePic ? (
              <img src={post.author.profilePic} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              post.author.username?.[0]?.toUpperCase()
            )}
          </div>
          <span className="text-zinc-900 dark:text-white font-semibold text-sm">{post.author.username}</span>
        </Link>
        <span className="text-zinc-500 text-xs">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* content */}
      <p className="text-zinc-700 dark:text-zinc-200 text-base leading-relaxed">{post.content}</p>

      {/* image if exists */}
      {post.image && (
        <img src={post.image} alt="post" className="rounded-xl w-full object-cover max-h-80" />
      )}

      {/* actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={handleLike}
          className={`text-sm font-medium transition ${liked ? "text-red-500" : "text-zinc-400 hover:text-red-400"}`}
        >
          {liked ? "♥" : "♡"} {likesCount}
        </button>

        <Link to={`/post/${post._id}`} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-sm transition">
          💬 {post.comments.length}
        </Link>

        {user?.id === post.author._id && (
          <button
            onClick={handleDelete}
            className="ml-auto text-zinc-400 hover:text-red-500 text-sm transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}