import React, { useMemo } from "react";
import { X, User } from "lucide-react";

const ReactionDetailModal = ({ reactions, onClose, authUser, handleReactionClick, msgId }) => {
  
  const processedReactions = useMemo(() => {
    const uniqueMap = new Map();
    
    reactions.forEach((r) => {

      const id = (r.userId?._id || r.userId)?.toString();
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, r);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => {
      const aId = (a.userId?._id || a.userId)?.toString();
      const bId = (b.userId?._id || b.userId)?.toString();
      const myId = authUser?._id?.toString();

      // Priority: "You" first
      if (aId === myId) return -1;
      if (bId === myId) return 1;

      const nameA = (a.userId?.fullName || a.displayName || "Unknown").toLowerCase();
      const nameB = (b.userId?.fullName || b.displayName || "Unknown").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [reactions, authUser?._id]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-black/80 backdrop-blur-xl w-full max-w-sm rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-bold text-lg text-white">Reactions</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
          {processedReactions.map((reaction, index) => {
            const userData = reaction.userId || {};
            const rUserId = (userData._id || userData)?.toString();
            const myId = authUser?._id?.toString();
            const isMe = rUserId === myId;
            
            const nameToDisplay = userData.fullName || reaction.displayName || "Unknown User";
            const avatar = userData.profilePic || reaction.profilePic || (isMe ? authUser?.profilePic : null);

            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                  isMe ? "cursor-pointer hover:bg-red-500/10 active:animate-shake" : "hover:bg-white/10"
                }`}
                onClick={(e) => {
                  if (isMe) {
                    e.stopPropagation();
                    // Pass the exact emoji to toggle it off
                    handleReactionClick(msgId, reaction.emoji, e);
                    onClose(); 
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isMe ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]" : "bg-white/10 border-white/20"
                  }`}>
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={20} className={isMe ? "text-cyan-400" : "text-white/30"} />
                    )}
                  </div>
                  
                  <div className="flex flex-col text-left">
                    <span className={`text-sm font-semibold ${isMe ? "text-cyan-400 font-bold" : "text-white/80"}`}>
                      {isMe ? "You" : nameToDisplay}
                    </span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
                      {isMe ? "Tap to remove" : "Reacted"}
                    </span>
                  </div>
                </div>
                <span className="text-2xl transition-transform group-hover:scale-110 animate-emoji">
                  {reaction.emoji}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

export default ReactionDetailModal;