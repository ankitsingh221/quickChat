import React from "react";
import { Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const App = () => {
  const { isCheckingAuth, authUser, checkAuth } = useAuthStore();
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle mobile viewport height changes (keyboard opening/closing)
  useEffect(() => {
    const handleResize = () => {
      // Use visualViewport for more accurate mobile height
      if (window.visualViewport) {
        setWindowHeight(window.visualViewport.height);
      } else {
        setWindowHeight(window.innerHeight);
      }
    };
    
    // Initial call
    handleResize();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('/background_image.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        overflow: "hidden",
      }}
    >
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

      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            color: '#00ffff',
            borderRadius: '1rem',
          },
        }}
      />
    </div>
  );
};

export default App;