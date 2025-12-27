import { Routes, Route, Navigate } from "react-router-dom"; //
import { AuthContext } from "./context/auth-context.js";
import { useAuth } from "./hooks/auth-hook.js";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Forums from "./pages/Forums.jsx";
import Auth from "./pages/Auth.jsx";
import Profile from "./pages/Profile.jsx";
import ForumDetails from "./pages/ForumDetails.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import NewForum from "./pages/NewForum.jsx";
import NewPost from "./pages/NewPost.jsx";

function App() {
  const { userId, username, email, pfp, token, loginHandler, logoutHandler } =
    useAuth();

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token,
        userId,
        username,
        email,
        pfp,
        loginHandler,
        logoutHandler,
      }}
    >
      <div className="mx-4 sm:mx-[10%]">
        <Navbar />
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Forums />} />

          {token && <Route path="/forum/new-forum" element={<NewForum />} />}

          <Route path="/forum/:forumId" element={<ForumDetails />} />

          <Route path="/post/:postId" element={<PostDetails />} />

          {token && (
            <Route path="/forum/:forumId/post/new-post" element={<NewPost />} />
          )}

          {/* Auth route */}
          <Route path="/auth/:authMode" element={<Auth />} />

          {token && <Route path="/profile" element={<Profile />} />}

          {/* Catch-all redirect: Sends any unknown route to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
