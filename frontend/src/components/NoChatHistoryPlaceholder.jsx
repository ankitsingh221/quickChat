import { MessageCircleIcon, Sparkles } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatHistoryPlaceholder = () => {
  const { selectedUser, selectedGroup, sendMessage, sendGroupMessage } = useChatStore();

  const isGroup = !!selectedGroup;
  const name = isGroup ? selectedGroup.groupName : selectedUser?.fullName;

  const handleQuickAction = async (msgText) => {
    if (!msgText) return;
    try {
      if (isGroup) {
        // Corrected to pass an object to match your store's destructuring
        await sendGroupMessage({ text: msgText });
      } else {
        await sendMessage({ text: msgText });
      }
    } catch (error) {
      console.error("Quick Action Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl px-8 py-10 text-center relative overflow-hidden">
        
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />

        {/* Icon */}
        <div className="relative z-10 mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-400/10 flex items-center justify-center shadow-inner">
          <MessageCircleIcon className="size-8 text-cyan-300" />
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-xl font-semibold text-slate-100 mb-2">
          No messages yet
        </h3>

        {/* Subtitle */}
        <p className="relative z-10 text-sm text-slate-400 mb-6">
          Start your first conversation with{" "}
          <span className="text-cyan-400 font-medium">{name}</span>
        </p>

        {/* Divider */}
        <div className="relative z-10 h-px w-40 mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* Quick actions */}
        <div className="relative z-10 flex flex-wrap gap-3 justify-center">
          {[
            "👋 Hey!",
            "🤝 How’s it going?",
            "Let's chat! 🚀",
          ].map((text) => (
            <button
              key={text}
              onClick={() => handleQuickAction(text)}
              className="group px-4 py-2 rounded-full text-xs font-medium
                         bg-white/5 text-cyan-300 border border-white/10
                         hover:bg-cyan-500/20 hover:border-cyan-400/30
                         transition-all duration-200 backdrop-blur-md"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Sparkles className="size-4 text-cyan-400/60" />
          Say something to break the ice
        </div>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;