import { useState, useEffect } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAndRead = async () => {
    try {
      const res = await axios.get("/notifications");
      console.log("Notifications response:", res.data); // ADD THIS
      setNotifications(res.data);
      await axios.put("/notifications/read");
    } catch (err) {
      console.error("Error:", err.response?.data); // ADD THIS
    } finally {
      setLoading(false);
    }
  };
  fetchAndRead();
}, []);

  const getMessage = (n) => {
  const senderName = n.sender?.username || "Someone";
  if (n.type === "like") return `${senderName} liked your post`;
  if (n.type === "comment") return `${senderName} commented on your post`;
  if (n.type === "follow") return `${senderName} started following you`;
  return "New notification";
};

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-zinc-900 dark:text-white text-2xl font-bold">Notifications</h1>

        {loading ? <Spinner /> : notifications.length === 0 ? (
          <p className="text-zinc-500 text-center mt-10">No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`rounded-2xl px-5 py-4 border transition ${
                n.read
                  ? "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                  : "bg-gray-100 dark:bg-zinc-800 border-zinc-700"
              }`}
            >
              <p className="text-zinc-900 dark:text-white text-sm">{getMessage(n)}</p>
              <p className="text-zinc-500 text-xs mt-1">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}