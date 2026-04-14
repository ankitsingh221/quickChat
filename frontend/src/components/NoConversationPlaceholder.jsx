import { MessageSquare, Sparkles } from "lucide-react";

function NoConversationPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative text-center max-w-md px-6">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl" />
        
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
          <MessageSquare className="w-12 h-12 text-cyan-400/60" />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-5 h-5 text-yellow-400/60 animate-pulse" />
          </div>
        </div>
        
        {/* Text */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Welcome to QuickChat
        </h3>
        <p className="text-white/40 text-sm">
          Select a conversation from the sidebar to start messaging
        </p>
        
        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-1 h-1 rounded-full bg-cyan-500/50 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-purple-500/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-1 h-1 rounded-full bg-cyan-500/50 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}

export default NoConversationPlaceholder;