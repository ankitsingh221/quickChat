import { useState, useRef, useEffect } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, Settings, ArrowLeft, Camera, Pencil } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
  });

  useEffect(() => {
    setFormData({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
    });
  }, [authUser]);

  const fileInputRef = useRef(null);

  const playClickSound = () => {
    if (isSoundEnabled) {
      mouseClickSound.currentTime = 0;
      mouseClickSound.play().catch(() => {});
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  playClickSound();

  // Create a local Preview URL (Instant)
  const previewUrl = URL.createObjectURL(file);
  
  //  Optimistically update the UI so the user sees the change immediately
  // We temporarily update the authUser object in the store
  const originalUser = { ...authUser };
  useAuthStore.setState({ authUser: { ...authUser, profilePic: previewUrl } });

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = async () => {
    try {
      await updateProfile({ profilePic: reader.result });
    } catch (error) {
      // If upload fails, roll back to the original image
      useAuthStore.setState({ authUser: originalUser });
      toast.error("Failed to upload image to server",error);
    }
  };
};

  const handleSaveInfo = async () => {
    playClickSound();
    if(!formData.fullName.trim()) return toast.error("Name cannot be empty");
    await updateProfile(formData);
  };

  return (
    <>
      {/* --- MAIN HEADER --- */}
      <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          
          {/* LEFT: User Display (Read Only - Removed onClick) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-11 rounded-full border-2 border-slate-700/50 overflow-hidden">
                <img 
                  src={authUser.profilePic || "/avatar.png"} 
                  alt="avatar" 
                  className="object-cover size-full" 
                />
              </div>
              <div className="absolute bottom-0 right-0 size-3 bg-cyan-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-slate-100 font-semibold text-sm leading-tight">
                {authUser.fullName}
              </h3>
              <span className="text-[11px] text-cyan-500 font-medium ">Online</span>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch(() => {});
                toggleSound();
              }}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isSoundEnabled ? "text-cyan-400 bg-cyan-400/10" : "text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {isSoundEnabled ? <Volume2Icon size={19} /> : <VolumeOffIcon size={19} />}
            </button>

            {/* ONLY this button opens Settings now */}
            <button
              onClick={() => { playClickSound(); setIsSettingsOpen(true); }}
              className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all duration-200 active:scale-90"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* --- SETTINGS SLIDE-OVER --- */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-left duration-300">
          <div className="h-[100px] bg-slate-900 flex items-end p-6 gap-6 border-b border-slate-800 shadow-lg">
            <button 
                onClick={() => { playClickSound(); setIsSettingsOpen(false); }} 
                className="text-slate-200 hover:bg-slate-800 p-2 rounded-full transition-all hover:scale-110"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-100 mb-1">Profile</h1>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="flex flex-col items-center py-10">
              <div className="relative group">
                <div className="size-48 rounded-full overflow-hidden border-[6px] border-slate-800 shadow-2xl">
                  <img 
                    src={authUser.profilePic || "/avatar.png"} 
                    className={`object-cover size-full transition-all duration-500 ${isUpdatingProfile ? "blur-sm opacity-50" : ""}`} 
                    alt="Profile" 
                  />
                </div>
                
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUpdatingProfile}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full text-white"
                >
                  <Camera size={32} className="mb-2" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-center">Change <br/> Photo</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                {isUpdatingProfile && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="loading loading-ring loading-lg text-cyan-500"></span>
                    </div>
                )}
              </div>
            </div>

            <div className="px-10 space-y-10">
              <div className="space-y-3">
                <label className="text-cyan-500 text-[11px] font-bold uppercase tracking-[2px]">Your Name</label>
                <div className="flex items-center gap-4 border-b-2 border-slate-800 focus-within:border-cyan-500 transition-all pb-2 group">
                  <input
                    type="text"
                    className="bg-transparent w-full outline-none text-slate-100 text-lg font-medium"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <Pencil size={18} className="text-slate-500" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-cyan-500 text-[11px] font-bold uppercase tracking-[2px]">About</label>
                <div className="flex items-center gap-4 border-b-2 border-slate-800 focus-within:border-cyan-500 transition-all pb-2 group">
                  <input
                    type="text"
                    className="bg-transparent w-full outline-none text-slate-200 text-base"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Set your status..."
                  />
                  <Pencil size={18} className="text-slate-500" />
                </div>
              </div>

              <button
                onClick={handleSaveInfo}
                disabled={isUpdatingProfile}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95"
              >
                {isUpdatingProfile ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </div>

            <div className="mt-16 px-10 pb-12">
                <button
                onClick={() => { playClickSound(); setShowLogoutConfirm(true); }}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl border border-red-500/10 transition-all group"
                >
                <LogOutIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm tracking-wide uppercase">Logout</span>
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT MODAL --- */}
      {showLogoutConfirm && (
        <div className="modal modal-open z-[110] backdrop-blur-sm">
          <div className="modal-box bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl">
            <h3 className="font-bold text-xl text-slate-100">Sign Out?</h3>
            <p className="text-slate-400 mt-3">You will be logged out of your account.</p>
            <div className="modal-action gap-3">
              <button className="btn btn-ghost rounded-xl" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn bg-red-600 hover:bg-red-500 border-none text-white px-8 rounded-xl" onClick={() => { playClickSound(); logout(); }}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileHeader;