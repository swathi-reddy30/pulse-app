import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const fileRef = useRef();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${id}`);
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setIsFollowing(res.data.user.followers.some(
        (fid) => fid.toString() === currentUser?.id?.toString()
      ));
    } catch (err) {
      console.error("Profile error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await axios.put("/users/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, profilePic: res.data.profilePic }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBioUpdate = async () => {
    try {
      const res = await axios.put("/users/profile/update", { bio: bioText });
      setProfile((prev) => ({ ...prev, bio: res.data.bio }));
      setEditingBio(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.put(`/users/follow/${id}`);
      setIsFollowing(!isFollowing);
      setProfile((prev) => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter((fid) => fid !== currentUser?.id)
          : [...prev.followers, currentUser?.id],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />
      <Spinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* profile card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              {/* avatar */}
              <div
                onClick={() => currentUser?.id?.toString() === id?.toString() && fileRef.current.click()}
                className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-zinc-900 dark:text-white font-bold text-xl bg-blue-600 shrink-0 ${
                  currentUser?.id?.toString() === id?.toString() ? "cursor-pointer hover:opacity-80 transition" : ""
                }`}
              >
                {profile?.profilePic ? (
                  <img src={profile.profilePic} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.username?.[0]?.toUpperCase()
                )}
              </div>

              {/* hidden file input */}
              {currentUser?.id?.toString() === id?.toString() && (
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              )}

              <div>
                <h2 className="text-zinc-900 dark:text-white font-bold text-lg">{profile?.username}</h2>

                {/* bio with edit */}
                {editingBio ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="bg-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your bio..."
                      maxLength={100}
                    />
                    <button
                      onClick={handleBioUpdate}
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingBio(false)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">{profile?.bio || "No bio yet"}</p>
                    {currentUser?.id?.toString() === id?.toString() && (
                      <button
                        onClick={() => { setEditingBio(true); setBioText(profile?.bio || ""); }}
                        className="text-zinc-500 hover:text-zinc-300 text-xs transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* follow button — hidden on own profile */}
            {currentUser?.id?.toString() !== id?.toString() && (
              <button
                onClick={handleFollow}
                className={`text-sm font-semibold px-5 py-2 rounded-lg transition shrink-0 ${
                  isFollowing
                    ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-900 dark:text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-zinc-900 dark:text-white"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          {/* stats */}
          <div className="flex gap-6 pt-2 border-t border-gray-200 dark:border-zinc-800">
            <div className="text-center pt-2">
              <p className="text-zinc-900 dark:text-white font-bold">{posts.length}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Posts</p>
            </div>
            <div className="text-center pt-2">
              <p className="text-zinc-900 dark:text-white font-bold">{profile?.followers?.length || 0}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Followers</p>
            </div>
            <div className="text-center pt-2">
              <p className="text-zinc-900 dark:text-white font-bold">{profile?.following?.length || 0}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Following</p>
            </div>
          </div>
        </div>

        {/* user posts */}
        {posts.length === 0 ? (
          <p className="text-zinc-500 text-center">No posts yet</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}