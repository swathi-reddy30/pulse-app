import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/useAuthStore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";


function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/profile/:id" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/post/:id" element={user ? <PostDetail /> : <Navigate to="/login" />} />
        <Route path="/search" element={user ? <Search /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;