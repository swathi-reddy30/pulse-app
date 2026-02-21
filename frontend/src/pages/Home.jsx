import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const res = await axios.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts([res.data, ...posts]);
      setContent("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* create post */}
        <form onSubmit={handleCreatePost} className="bg-white dark:bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
          <textarea
            rows={3}
            placeholder="What's on your mind?"
            className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
          />

          {preview && (
            <div className="relative">
              <img src={preview} alt="preview" className="rounded-xl max-h-60 object-cover w-full" />
              <button
                type="button"
                onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-gray-50 dark:bg-gray-50 dark:bg-black bg-opacity-60 text-zinc-900 dark:text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-opacity-80"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 text-xs">{content.length}/280</span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white text-sm transition"
              >
                📷 Photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <button
              type="submit"
              disabled={(!content.trim() && !image) || posting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 dark:text-white text-sm font-semibold px-6 py-2 rounded-lg transition"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>

        {/* feed */}
        {loading ? <Spinner /> : posts.length === 0 ? (
          <p className="text-zinc-500 text-center">No posts yet. Be the first!</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}