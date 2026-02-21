import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { connectSocket, disconnectSocket, getSocket } from "../socket";
import axios from "../api/axios";
import useThemeStore from "../store/useThemeStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (!user) return;

    // fetch unread count on mount
    axios.get("/notifications").then((res) => {
      setUnread(res.data.filter((n) => !n.read).length);
    });

    // connect socket
    const socket = connectSocket(user.id);

    socket.on("newNotification", () => {
      setUnread((prev) => prev + 1);
    });

    return () => disconnectSocket();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <Link to="/" className="text-white dark:text-white text-2xl font-black tracking-tight">Pulse</Link>

      <div className="flex items-center gap-5">
        <Link to="/" className="text-zinc-400 hover:text-white transition text-base">Home</Link>
        <Link to="/search" className="text-zinc-400 hover:text-white transition text-base">Search</Link>

        {/* notification bell */}
        <Link
          to="/notifications"
          onClick={() => setUnread(0)}
          className="relative text-zinc-400 hover:text-white transition text-base"
        >
          🔔
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unread}
            </span>
          )}
        </Link>

        <Link to={`/profile/${user?.id}`} className="text-zinc-400 hover:text-white transition text-base">
          {user?.username}
        </Link>

        <button
          onClick={toggleTheme}
          className="text-zinc-400 hover:text-white transition text-lg"
          title="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
        <button
          onClick={handleLogout}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-base px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}