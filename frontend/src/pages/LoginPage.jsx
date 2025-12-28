import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  MessageCircleIcon,
  MailIcon,
  LoaderIcon,
  LockIcon,
} from "lucide-react";
import { Link } from "react-router";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 bg-slate-900">
      <div className="relative w-full max-w-[450px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col">
            <div className="px-6 py-6 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                    <MessageCircleIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-400 mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-slate-400">
                    Login to your account
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label text-sm mb-1 block">
                      Email
                    </label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input py-2"
                        placeholder="ankitsingh@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label text-sm mb-1 block">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="input py-2"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className="auth-btn mt-2"
                    type="submit"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <Link to="/signup" className="auth-link text-sm">
                    Don't have an account? Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default LoginPage;
