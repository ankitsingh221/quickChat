import { useState, useRef, useEffect } from "react";
import {
  LogOutIcon,
  VolumeOffIcon,
  Volume2Icon,
  Settings,
  Camera,
  Pencil,
  X,
  Crop,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import ImageCropper from "./ImageCropper";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

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
  const sidebarRef = useRef(null);

  const playClickSound = () => {
    if (isSoundEnabled) {
      mouseClickSound.currentTime = 0;
      mouseClickSound.play().catch(() => {});
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSettingsOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isSettingsOpen]);

  // Handle new image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    playClickSound();

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setIsEditingExisting(false);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle editing existing profile picture
  const handleEditExistingImage = () => {
    playClickSound();
    if (authUser?.profilePic && authUser.profilePic !== "/avatar.png") {
      setTempImage(authUser.profilePic);
      setIsEditingExisting(true);
      setShowCropper(true);
    } else {
      // If no custom profile picture, open file picker
      fileInputRef.current?.click();
    }
  };

  // Handle cropped image upload
  const handleCropComplete = async (croppedImage) => {
    setShowCropper(false);
    
    // Store the cropped image temporarily for preview
    const croppedImageData = croppedImage;
    
    // Show preview immediately with optimistic update
    const originalUser = { ...authUser };
    useAuthStore.setState({
      authUser: { ...authUser, profilePic: croppedImageData },
    });

    try {
      await updateProfile({ profilePic: croppedImageData });
    } catch (error) {
      // Rollback on error
      useAuthStore.setState({ authUser: originalUser });
      toast.error(error?.message || "Failed to upload image");
      console.error("Upload error:", error);
    } finally {
      // Clean up
      setTempImage(null);
      setIsEditingExisting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveInfo = async () => {
    playClickSound();
    if (!formData.fullName.trim()) return toast.error("Name cannot be empty");
    
    try {
      await updateProfile(formData);
      setIsSettingsOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  return (
    <>
      {/* SIMPLE SIDEBAR HEADER - Glassmorphic */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border border-cyan-500/50 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-transparent">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="avatar"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-500 rounded-full ring-1 ring-black shadow-[0_0_5px_#00ffff]"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {authUser?.fullName || "User"}
              </h3>
              <span className="text-[10px] text-cyan-400">Online</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch(() => {});
                toggleSound();
              }}
              className={`p-2 rounded-full transition-all ${
                isSoundEnabled
                  ? "text-cyan-400 bg-cyan-500/20"
                  : "text-white/40 hover:bg-white/10"
              }`}
            >
              {isSoundEnabled ? (
                <Volume2Icon size="16" />
              ) : (
                <VolumeOffIcon size="16" />
              )}
            </button>
            <button
              onClick={() => {
                playClickSound();
                setIsSettingsOpen(true);
              }}
              className="p-2 text-white/40 hover:text-cyan-400 hover:bg-white/10 rounded-full transition-all"
            >
              <Settings size="16" />
            </button>
          </div>
        </div>
      </div>

      {/* SETTINGS SIDEBAR */}
      {isSettingsOpen && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsSettingsOpen(false)}
          />

          <div
            ref={sidebarRef}
            className="fixed top-0 right-0 z-[151] h-full w-full max-w-md bg-black/60 backdrop-blur-xl border-l border-white/20 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Profile Settings
                </h2>
                <p className="text-sm text-white/60 mt-0.5">
                  Update your personal information
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Profile Image */}
              <div className="flex flex-col items-center py-10">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                    <img
                      src={authUser?.profilePic || "/avatar.png"}
                      className={`object-cover w-full h-full transition-all ${isUpdatingProfile ? "blur-sm opacity-50" : ""}`}
                      alt="Profile"
                    />
                    {isUpdatingProfile && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {/* Edit/Crop existing image button */}
                    {authUser?.profilePic && authUser.profilePic !== "/avatar.png" && (
                      <button
                        onClick={handleEditExistingImage}
                        disabled={isUpdatingProfile}
                        className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform duration-300 disabled:opacity-50"
                        title="Edit current picture"
                      >
                        <Crop size="14" />
                      </button>
                    )}
                    
                    {/* Upload new image button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUpdatingProfile}
                      className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg hover:scale-110 transition-transform duration-300 disabled:opacity-50"
                      title="Upload new picture"
                    >
                      <Camera size="14" />
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </div>
                <p className="text-white/40 text-xs mt-6">
                  Click camera to upload new • Click crop to edit current
                </p>
              </div >

              {/* Form Fields */}
              <div className="px-6 space-y-6 pb-10">
                <div>
                  <label className="text-cyan-400 text-[11px] font-bold uppercase tracking-wider block mb-2">
                    Your Name
                  </label>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus-within:border-cyan-500 transition-all duration-300">
                    <input
                      type="text"
                      className="bg-transparent flex-1 outline-none text-white text-base placeholder:text-white/30"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your name"
                    />
                    <Pencil size="16" className="text-white/40" />
                  </div>
                </div>

                <div>
                  <label className="text-cyan-400 text-[11px] font-bold uppercase tracking-wider block mb-2">
                    About
                  </label>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus-within:border-cyan-500 transition-all duration-300">
                    <input
                      type="text"
                      className="bg-transparent flex-1 outline-none text-white/80 text-sm placeholder:text-white/30"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Set your status..."
                    />
                    <Pencil size="16" className="text-white/40" />
                  </div>
                </div>

                <button
                  onClick={handleSaveInfo}
                  disabled={isUpdatingProfile}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUpdatingProfile ? "SAVING..." : "SAVE PROFILE"}
                </button>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      playClickSound();
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl border border-red-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <LogOutIcon size="16" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* IMAGE CROPPER MODAL */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropper(false);
            setTempImage(null);
            setIsEditingExisting(false);
            // Reset file input when cancelling
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl max-w-sm w-full mx-4 p-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="font-bold text-xl text-white">Sign Out?</h3>
            <p className="text-white/50 mt-2 text-sm">
              You will be logged out of your account.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 py-2.5 text-white/60 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => {
                  playClickSound();
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