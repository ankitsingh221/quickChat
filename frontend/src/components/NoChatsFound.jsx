import { MessageCircleIcon, ArrowRight } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex items-center justify-center py-14 px-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl px-6 py-8 text-center overflow-hidden">

        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        {/* Icon */}
        <div className="relative z-10 mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-400/10 flex items-center justify-center shadow-inner">
          <MessageCircleIcon className="w-8 h-8 text-cyan-300" />
        </div>

        {/* Text */}
        <h4 className="relative z-10 text-base font-semibold text-slate-100 mb-1">
          No conversations yet
        </h4>
        <p className="relative z-10 text-sm text-slate-400 mb-5">
          Start chatting by selecting someone from your contacts.
        </p>

        {/* Action */}
        <button
          onClick={() => setActiveTab("contacts")}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                     text-cyan-300 bg-cyan-500/10 rounded-xl
                     border border-white/10
                     hover:bg-cyan-500/20 hover:border-cyan-400/30
                     transition-all duration-200"
        >
          Find contacts
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default NoChatsFound;
