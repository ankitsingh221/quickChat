import React from "react";
import { X, CheckCheck } from "lucide-react";
import dayjs from "dayjs";
import { useChatStore } from "../../store/useChatStore";

const MessageInfoDrawer = ({ msg, onClose }) => {
  const { selectedGroup } = useChatStore();

  // 1. Separate members into Read and Delivered categories
  //  "Read" are those in seenBy, "Delivered" are the rest (minus sender)
  const readBy = selectedGroup.members.filter((m) => 
    msg.seenBy.includes(m._id || m) && (m._id || m) !== msg.senderId
  );
  
  const deliveredTo = selectedGroup.members.filter((m) => 
    !msg.seenBy.includes(m._id || m) && (m._id || m) !== msg.senderId
  );

  //Helper to format WhatsApp-style timestamps
  const formatTime = (date) => {
    if (!date) return "Just now";
    const d = dayjs(date);
    if (d.isSame(dayjs(), 'day')) return d.format("HH:mm");
    if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return "Yesterday, " + d.format("HH:mm");
    return d.format("DD/MM/YY, HH:mm");
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-[400px] bg-[#0b141a] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-800">
        
        {/* Header (WhatsApp Dark Mode Style) */}
        <div className="h-[110px] bg-[#202c33] flex flex-col justify-end p-4 gap-4">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-1 hover:bg-slate-700/50 rounded-full transition-colors">
              <X size={24} className="text-slate-300" />
            </button>
            <h2 className="text-lg font-medium text-[#e9edef]">Message info</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b141a]">
          {/* Message Preview Section */}
          <div className="p-5 flex justify-end bg-[#0b141a] mb-2">
            <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-lg rounded-tr-none shadow-md max-w-[85%] relative">
              <p className="text-[14.2px] leading-relaxed pr-12">{msg.text}</p>
              <div className="flex items-center gap-1 absolute bottom-1 right-2">
                <span className="text-[11px] text-[#8696a0]">
                  {dayjs(msg.createdAt).format("HH:mm")}
                </span>
                {/* Overall status for the sender */}
                <CheckCheck size={16} className={readBy.length === (selectedGroup.members.length - 1) ? "text-[#53bdeb]" : "text-[#8696a0]"} />
              </div>
            </div>
          </div>

          {/* READ BY SECTION */}
          <div className="bg-[#111b21]">
            <div className="px-6 py-4 flex items-center gap-4 border-b border-[#202c33]">
              <CheckCheck size={20} className="text-[#53bdeb]" />
              <span className="text-[#53bdeb] text-sm font-normal">Read</span>
            </div>
            
            <div className="divide-y divide-[#202c33]">
              {readBy.map((user) => (
                <div key={user._id} className="px-6 py-3 flex items-center gap-4 hover:bg-[#202c33] cursor-pointer transition-colors">
                  <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e9edef] font-normal truncate">{user.fullName}</p>
                    <p className="text-[13px] text-[#8696a0]">{formatTime(msg.updatedAt)}</p>
                  </div>
                </div>
              ))}
              {readBy.length === 0 && (
                <div className="px-6 py-8 flex flex-col items-center justify-center opacity-40">
                   <CheckCheck size={40} className="text-slate-500 mb-2" />
                   <p className="text-slate-400 text-sm italic">No one has read this yet</p>
                </div>
              )}
            </div>
          </div>

          {/* DELIVERED TO SECTION */}
          <div className="bg-[#111b21] mt-2 pb-10">
            <div className="px-6 py-4 flex items-center gap-4 border-b border-[#202c33]">
              <CheckCheck size={20} className="text-[#8696a0]" />
              <span className="text-[#8696a0] text-sm font-normal">Delivered</span>
            </div>
            
            <div className="divide-y divide-[#202c33]">
              {deliveredTo.map((user) => (
                <div key={user._id} className="px-6 py-3 flex items-center gap-4 hover:bg-[#202c33] transition-colors">
                  <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover grayscale-[0.5]" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e9edef] font-normal truncate">{user.fullName}</p>
                    <p className="text-[13px] text-[#8696a0]">Delivered</p>
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