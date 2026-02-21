import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import useAuthStore from "../store/useAuthStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-zinc-900 dark:text-white text-3xl font-bold mb-6 text-center">Welcome Back</h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-zinc-900 dark:text-white font-semibold py-3 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}