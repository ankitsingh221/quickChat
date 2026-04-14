import React from "react";
import { X, CheckCheck } from "lucide-react";
import dayjs from "dayjs";
import { useChatStore } from "../../store/useChatStore";

const MessageInfoDrawer = ({ msg, onClose }) => {
  const { selectedGroup } = useChatStore();

  if (!selectedGroup || !selectedGroup.members) return null;

  // Refined Filtering logic
  const readBy = selectedGroup.members.filter((m) => {
    const memberId = m._id || m;
    return msg.seenBy?.some(id => String(id) === String(memberId)) && String(memberId) !== String(msg.senderId);
  });
  
  const deliveredTo = selectedGroup.members.filter((m) => {
    const memberId = m._id || m;
    return !msg.seenBy?.some(id => String(id) === String(memberId)) && String(memberId) !== String(msg.senderId);
  });

  // Helper to format timestamps
  const formatTime = (date) => {
    if (!date) return "Just now";
    const d = dayjs(date);
    if (d.isSame(dayjs(), 'day')) return d.format("HH:mm");
    if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return "Yesterday, " + d.format("HH:mm");
    return d.format("DD/MM/YY, HH:mm");
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop - Glassmorphic */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Drawer Content - Glassmorphic */}
      <div className="relative w-full max-w-[400px] bg-black/80 backdrop-blur-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/20">
        
        {/* Header */}
        <div className="h-[110px] bg-white/5 flex flex-col justify-end p-4 gap-4">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} className="text-white/60" />
            </button>
            <h2 className="text-lg font-medium text-white">Message Info</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
          {/* Message Preview Section */}
          <div className="p-5 flex justify-end bg-transparent mb-2">
            <div className="bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 text-white p-3 rounded-lg rounded-tr-none shadow-md max-w-[85%] relative border border-cyan-500/30">
              <p className="text-[14.2px] leading-relaxed pr-12 text-white/90">{msg.text}</p>
              <div className="flex items-center gap-1 absolute bottom-1 right-2">
                <span className="text-[11px] text-white/40">
                  {dayjs(msg.createdAt).format("HH:mm")}
                </span>
                {/* Overall status for the sender */}
                <CheckCheck size={16} className={readBy.length === (selectedGroup.members.length - 1) ? "text-cyan-400" : "text-white/30"} />
              </div>
            </div>
          </div>

          {/* READ BY SECTION */}
          <div className="bg-white/5">
            <div className="px-6 py-4 flex items-center gap-4 border-b border-white/10">
              <CheckCheck size={20} className="text-cyan-400" />
              <span className="text-cyan-400 text-sm font-normal">Read</span>
            </div>
            
            <div className="divide-y divide-white/10">
              {readBy.map((user) => (
                <div key={user._id} className="px-6 py-3 flex items-center gap-4 hover:bg-white/10 cursor-pointer transition-colors">
                  <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover border border-white/20" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 font-normal truncate">{user.fullName}</p>
                    <p className="text-[13px] text-white/40">{formatTime(msg.updatedAt)}</p>
                  </div>
                </div>
              ))}
              {readBy.length === 0 && (
                <div className="px-6 py-8 flex flex-col items-center justify-center opacity-40">
                  <CheckCheck size={40} className="text-white/30 mb-2" />
                  <p className="text-white/30 text-sm italic">No one has read this yet</p>
                </div>
              )}
            </div>
          </div>

          {/* DELIVERED TO SECTION */}
          <div className="bg-white/5 mt-2 pb-10">
            <div className="px-6 py-4 flex items-center gap-4 border-b border-white/10">
              <CheckCheck size={20} className="text-white/40" />
              <span className="text-white/40 text-sm font-normal">Delivered</span>
            </div>
            
            <div className="divide-y divide-white/10">
              {deliveredTo.map((user) => (
                <div key={user._id} className="px-6 py-3 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover border border-white/20 grayscale-[0.5]" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 font-normal truncate">{user.fullName}</p>
                    <p className="text-[13px] text-white/40">Delivered</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInfoDrawer;