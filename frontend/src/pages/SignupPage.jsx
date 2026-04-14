import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  MessageCircleIcon,
  MailIcon,
  LoaderIcon,
  LockIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router";

function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px]">
        {/* Glassmorphic Card */}
        <div className="relative rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative z-10 px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                <MessageCircleIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Create Account
              </h2>
              <p className="text-sm text-white/40">Sign up to start chatting</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* FULL NAME INPUT */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 size-5" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    placeholder="Ankit singh"
                  />
                </div>
              </div>

              {/* EMAIL INPUT */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Email
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 size-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    placeholder="ankit@example.com"
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 size-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all mt-4 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Already have an account?{" "}
                <span className="font-semibold">Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
