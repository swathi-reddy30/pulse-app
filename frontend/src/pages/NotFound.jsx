import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <h1 className="text-white text-6xl font-bold">404</h1>
      <p className="text-zinc-400 text-lg">Page not found</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
        Go Home
      </Link>
    </div>
  );
}