import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <div className="avatar online">
              <button
                className="size-14 rounded-full overflow-hidden relative group"
                onClick={() => fileInputRef.current.click()}
              >
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="User avatar"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs">Change</span>
                </div>
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* USER INFO */}
            <div>
              <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
                {authUser.fullName}
              </h3>
              <p className="text-slate-400 text-xs">Online</p>
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex gap-4 items-center">
            {/* LOGOUT */}
           <button
  onClick={() => setShowLogoutConfirm(true)}
  className="group flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
>
  <LogOutIcon className="size-5 group-hover:-translate-x-1 transition-transform" />
</button>

            {/* SOUND TOGGLE */}
            <button
              className="text-slate-400 hover:text-slate-200 transition-colors"
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch(() => {});
                toggleSound();
              }}
            >
              {isSoundEnabled ? (
                <Volume2Icon className="size-5" />
              ) : (
                <VolumeOffIcon className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-semibold text-lg text-slate-200">
              Confirm Logout
            </h3>

            <p className="text-slate-400 mt-2">
              Are you sure you want to log out?
            </p>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-error"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileHeader;
