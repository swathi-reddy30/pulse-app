import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { formatDistanceToNow } from "date-fns";


export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

const fetchPost = async () => {
  try {
    const res = await axios.get(`/posts/${id}`);
    setPost(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await axios.post(`/posts/comment/${id}`, { text: comment });
      setPost((prev) => ({ ...prev, comments: res.data }));
      setComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
  const confirmed = window.confirm("Delete this comment?");
  if (!confirmed) return;
  try {
    await axios.delete(`/posts/comment/${id}/${commentId}`);
    setPost((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));
  } catch (err) {
    console.error(err);
  }
};


    if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">

        <Navbar />
        <div className="mt-20 flex justify-center">
        <Spinner />
        </div>
    </div>
    );

  if (!post) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">

      <Navbar />
      <p className="text-zinc-500 text-center mt-20">Post not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">

      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* post */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
          <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-zinc-900 dark:text-white font-bold text-sm">
              {post.author.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-zinc-900 dark:text-white font-semibold text-sm">{post.author.username}</span>
          </Link>
          <p className="text-zinc-200 text-sm leading-relaxed">{post.content}</p>
          <p className="text-zinc-500 text-xs">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
        </div>

        {/* add comment */}
        <form onSubmit={handleComment} className="flex gap-3">
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-zinc-900 dark:text-white text-sm font-semibold px-5 rounded-xl transition"
          >
            Post
          </button>
        </form>

        {/* comments */}
        <div className="flex flex-col gap-3">
          {post.comments.length === 0 ? (
            <p className="text-zinc-500 text-center text-sm">No comments yet</p>
          ) : (
            post.comments.map((c) => (
              <div key={c._id} className="bg-white dark:bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-blue-400 text-xs font-semibold">
                    {c.user?.username || "User"}
                  </span>
                  <p className="text-zinc-200 text-sm">{c.text}</p>
                </div>
                {user?.id === c.user?._id && (
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    className="text-zinc-600 hover:text-red-500 text-xs transition shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}