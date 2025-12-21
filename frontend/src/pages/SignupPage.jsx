import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function SignupPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 bg-slate-900">
      <div className="relative w-full max-w-[450px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col">
            {/* Reduced vertical padding (py-5) to accommodate the extra field */}
            <div className="px-6 py-5 flex items-center justify-center">
              <div className="w-full max-w-md">
                
                {/* COMPACT HEADING */}
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <MessageCircleIcon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-400">Join QuickChat</h2>
                  <p className="text-xs text-slate-400">Create your account to get started</p>
                </div>

                {/* COMPACT FORM (space-y-3 instead of 6) */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* FULL NAME */}
                  <div>
                    <label className="auth-input-label text-xs mb-1 block">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon w-4 h-4" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input py-2 text-sm"
                        placeholder="Ankit Singh"
                      />
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label text-xs mb-1 block">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon w-4 h-4" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input py-2 text-sm"
                        placeholder="ankitsingh@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label text-xs mb-1 block">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon w-4 h-4" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input py-2 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="auth-btn mt-2 py-2.5 text-sm" type="submit" disabled={isSigningUp}>
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-4 animate-spin text-center" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* COMPACT LINK */}
                <div className="mt-4 text-center">
                  <Link to="/login" className="auth-link text-xs">
                    Already have an account? Login
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

export default SignupPage;