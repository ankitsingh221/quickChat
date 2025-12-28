import React from "react";
import { Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

const App = () => {
  const { isCheckingAuth, authUser, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen  bg-slate-900   flex items-center justify-center p-4 overflow-hidden">
      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to={"/"} />}
        />

        <Route path="*" element={<Navigate to={"/"} />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
