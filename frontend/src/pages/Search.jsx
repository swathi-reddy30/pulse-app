import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`/users/search?search=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        <h1 className="text-zinc-900 dark:text-white text-2xl font-bold">Search Users</h1>

        {/* search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Search by username..."
            className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-zinc-900 dark:text-white text-sm font-semibold px-6 rounded-xl transition"
          >
            Search
          </button>
        </form>

        {/* results */}
        {loading && <p className="text-zinc-500 text-center">Searching...</p>}

        {!loading && searched && results.length === 0 && (
          <p className="text-zinc-500 text-center">No users found</p>
        )}

        <div className="flex flex-col gap-3">
          {results.map((u) => (
            <Link
              to={`/profile/${u._id}`}
              key={u._id}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-zinc-600 transition"
            >
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-zinc-900 dark:text-white font-bold">
                {u.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-zinc-900 dark:text-white font-semibold">{u.username}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{u.bio || "No bio"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}