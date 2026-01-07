import { MessageCircleIcon, Users } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl px-8 py-10 text-center overflow-hidden">

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

        {/* Icon container */}
        <div className="relative z-10 mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-400/10 flex items-center justify-center shadow-inner">
          <MessageCircleIcon className="size-10 text-cyan-300" />
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-xl font-semibold text-slate-100 mb-2">
          No conversation selected
        </h3>

        {/* Description */}
        <p className="relative z-10 text-sm text-slate-400 leading-relaxed">
          Pick a contact from the sidebar to start a new chat or continue where you left off.
        </p>

        {/* Divider */}
        <div className="relative z-10 h-px w-36 mx-auto my-6 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* Hint */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Users className="size-4 text-cyan-400/60" />
          Your conversations will appear here
        </div>
      </div>
    </div>
  );
};

export default NoConversationPlaceholder;
